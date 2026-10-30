import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ZoomIn, ZoomOut, MapPin, Compass, ArrowDown, ArrowUp } from 'lucide-react';

// Convert Latitude and Longitude to 3D Cartesian coordinates on sphere of radius R
function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

// Convert 3D Cartesian coordinates on sphere back to Latitude & Longitude
function vector3ToLatLng(vector, radius) {
  const norm = vector.clone().normalize();
  const lat = 90 - (Math.acos(Math.max(-1, Math.min(1, norm.y))) * (180 / Math.PI));
  let lng = ((Math.atan2(norm.z, -norm.x) * (180 / Math.PI)) - 180);
  
  while (lng < -180) lng += 360;
  while (lng > 180) lng -= 360;

  return {
    lat: Math.round(lat * 10000) / 10000,
    lng: Math.round(lng * 10000) / 10000
  };
}

export default function GlobeHUD({
  center,
  currentAddress,
  onSelectCoordinates,
  onTransitionToMap,
  onScrollToOverview
}) {
  const mountRef = useRef(null);
  const [hoveredCoords, setHoveredCoords] = useState(null);
  const [cameraDistance, setCameraDistance] = useState(175);
  const [isAutoRotating, setIsAutoRotating] = useState(true);

  // References to keep animation loop & interactions clean
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const globeGroupRef = useRef(null);
  const cloudsMeshRef = useRef(null);
  const markerMeshRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const rotationVelocityRef = useRef({ x: 0, y: 0 });

  const GLOBE_RADIUS = 60;
  const MIN_CAMERA_DIST = 75; // Zooming closer than this triggers street map view
  const MAX_CAMERA_DIST = 250;

  // Initialize Three.js 3D Globe Scene (Google Maps Style Deep Space & Atmosphere)
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Deep Cosmic Space Background (Exact Google Maps dark space palette)
    scene.background = new THREE.Color(0x02040b);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1500);
    camera.position.set(0, 0, 175);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and high DPR
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Realistic 3D Starfield Background (Thousands of twinkling stars of varying temperatures)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 400 + Math.random() * 500;
      const sinPhi = Math.sin(phi);

      starPositions[i * 3] = r * sinPhi * Math.cos(theta);
      starPositions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      starPositions[i * 3 + 2] = r * Math.cos(phi);

      // Natural stellar colors: crisp white, pale blue, soft amber
      const type = Math.random();
      if (type > 0.85) {
        starColors[i * 3] = 0.75;
        starColors[i * 3 + 1] = 0.88;
        starColors[i * 3 + 2] = 1.0; // blue-white
      } else if (type > 0.70) {
        starColors[i * 3] = 1.0;
        starColors[i * 3 + 1] = 0.94;
        starColors[i * 3 + 2] = 0.82; // warm star
      } else {
        const val = 0.65 + Math.random() * 0.35;
        starColors[i * 3] = val;
        starColors[i * 3 + 1] = val;
        starColors[i * 3 + 2] = val; // white
      }
    }

    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.88,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 5. Lighting (Sunlight placed to create oceanic specular glint like Google Maps)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);

    // Directional Sun Light
    const sunLight = new THREE.DirectionalLight(0xfffbf0, 2.2);
    sunLight.position.set(130, 50, 110);
    scene.add(sunLight);

    // Subtle blue rim light for Earth silhouette
    const rimLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    rimLight.position.set(-140, -40, -100);
    scene.add(rimLight);

    // 6. Globe Group
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/textures/earth.jpg',
      (earthTexture) => {
        earthTexture.colorSpace = THREE.SRGBColorSpace;
        earthTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        // Earth Sphere Mesh with Ocean Specular Reflection
        const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
        const earthMaterial = new THREE.MeshPhongMaterial({
          map: earthTexture,
          specular: new THREE.Color(0x3b82f6), // Ocean sun specular reflection
          shininess: 32,
        });

        const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
        earthMesh.name = 'EarthSphere';
        globeGroup.add(earthMesh);

        // 7. Realistic Clouds Layer
        textureLoader.load('/textures/clouds.png', (cloudTexture) => {
          cloudTexture.colorSpace = THREE.SRGBColorSpace;
          const cloudGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.008, 64, 64);
          const cloudMat = new THREE.MeshStandardMaterial({
            map: cloudTexture,
            transparent: true,
            opacity: 0.85,
            blending: THREE.NormalBlending,
            depthWrite: false,
          });
          const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
          cloudMesh.name = 'CloudsSphere';
          globeGroup.add(cloudMesh);
          cloudsMeshRef.current = cloudMesh;
        });

        // 8. Atmospheric Glow Limb (Google Maps Signature Cyan Halo)
        const atmosVertexShader = `
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `;
        const atmosFragmentShader = `
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.6);
            gl_FragColor = vec4(0.24, 0.65, 1.0, 1.0) * intensity * 1.8;
          }
        `;

        const atmosGeo = new THREE.SphereGeometry(GLOBE_RADIUS * 1.035, 64, 64);
        const atmosMat = new THREE.ShaderMaterial({
          vertexShader: atmosVertexShader,
          fragmentShader: atmosFragmentShader,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
        });
        const atmosMesh = new THREE.Mesh(atmosGeo, atmosMat);
        globeGroup.add(atmosMesh);

        // Position globe to face initial coordinates
        rotateToCoordinates(center.lat, center.lng);
      },
      undefined,
      (err) => {
        console.warn("Could not load Earth texture:", err);
      }
    );

    // 9. Target Location Marker (Pin + Ring on Spherical Surface)
    const markerGroup = new THREE.Group();
    globeGroup.add(markerGroup);
    markerMeshRef.current = markerGroup;

    // Animated beacon ring
    const ringGeo = new THREE.RingGeometry(1.2, 1.9, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.95,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    markerGroup.add(ringMesh);

    // Inner bright center point
    const dotGeo = new THREE.CircleGeometry(0.85, 24);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    const dotMesh = new THREE.Mesh(dotGeo, dotMat);
    markerGroup.add(dotMesh);

    updateMarkerPosition(center.lat, center.lng);

    // 10. Render Loop with gentle cloud motion and inertia
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      // Pulse beacon ring
      const t = clock.getElapsedTime() * 3.5;
      const scale = 1.0 + Math.sin(t) * 0.22;
      ringMesh.scale.set(scale, scale, scale);

      // Gentle cloud drift
      if (cloudsMeshRef.current) {
        cloudsMeshRef.current.rotation.y += 0.0003;
      }

      // Handle rotation and inertia
      if (!isDraggingRef.current) {
        if (isAutoRotating) {
          globeGroup.rotation.y += 0.001;
        } else {
          globeGroup.rotation.y += rotationVelocityRef.current.x;
          globeGroup.rotation.x += rotationVelocityRef.current.y;

          // Limit pitch so poles don't invert
          globeGroup.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroup.rotation.x));

          rotationVelocityRef.current.x *= 0.93;
          rotationVelocityRef.current.y *= 0.93;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update target pin position whenever center changes
  const updateMarkerPosition = (lat, lng) => {
    if (!markerMeshRef.current) return;
    const pos = latLngToVector3(lat, lng, GLOBE_RADIUS + 0.35);
    markerMeshRef.current.position.copy(pos);
    markerMeshRef.current.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 0, 1),
      pos.clone().normalize()
    );
  };

  useEffect(() => {
    updateMarkerPosition(center.lat, center.lng);
  }, [center.lat, center.lng]);

  // Smoothly rotate globe to face coordinates
  const rotateToCoordinates = (lat, lng) => {
    if (!globeGroupRef.current) return;
    const phi = (lat * Math.PI) / 180;
    const theta = (lng * Math.PI) / 180;

    globeGroupRef.current.rotation.x = phi;
    globeGroupRef.current.rotation.y = -theta - Math.PI / 2;
  };

  // Mouse & Touch Interaction Handlers
  const handleMouseDown = (e) => {
    isDraggingRef.current = true;
    setIsAutoRotating(false);
    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseMove = (e) => {
    // 1. Raycast hover over Earth surface to get geographic coords
    if (rendererRef.current && cameraRef.current && globeGroupRef.current) {
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const earthMesh = globeGroupRef.current.getObjectByName('EarthSphere');
      if (earthMesh) {
        const intersects = raycaster.intersectObject(earthMesh, false);
        if (intersects.length > 0) {
          const localPoint = earthMesh.worldToLocal(intersects[0].point.clone());
          const coords = vector3ToLatLng(localPoint, GLOBE_RADIUS);
          setHoveredCoords(coords);
        } else {
          setHoveredCoords(null);
        }
      }
    }

    // 2. Drag rotation
    if (!isDraggingRef.current || !globeGroupRef.current) return;

    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    const speed = 0.005;
    globeGroupRef.current.rotation.y += deltaX * speed;
    globeGroupRef.current.rotation.x += deltaY * speed;

    globeGroupRef.current.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, globeGroupRef.current.rotation.x));

    rotationVelocityRef.current = {
      x: deltaX * speed * 0.65,
      y: deltaY * speed * 0.65,
    };

    previousMousePositionRef.current = {
      x: e.clientX,
      y: e.clientY,
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Scroll Wheel Zoom: zooms 3D globe smoothly without scrolling the outer page
  const handleWheel = (e) => {
    e.preventDefault();
    if (!cameraRef.current) return;

    const zoomStep = e.deltaY * 0.12;
    const newDist = Math.max(MIN_CAMERA_DIST, Math.min(MAX_CAMERA_DIST, cameraRef.current.position.z + zoomStep));
    cameraRef.current.position.z = newDist;
    setCameraDistance(Math.round(newDist));

    // If user zooms in very close, seamlessly transition to 2D Street Satellite CAD!
    if (newDist <= MIN_CAMERA_DIST + 4) {
      if (onTransitionToMap) {
        onTransitionToMap(center.lat, center.lng, 18);
      }
    }
  };

  // Click on globe to place or select target
  const handleClick = (e) => {
    if (hoveredCoords && onSelectCoordinates) {
      onSelectCoordinates(hoveredCoords);
    }
  };

  // Double click anywhere on globe to zoom straight in
  const handleDoubleClick = (e) => {
    if (hoveredCoords && onTransitionToMap) {
      onTransitionToMap(hoveredCoords.lat, hoveredCoords.lng, 19);
    } else if (onTransitionToMap) {
      onTransitionToMap(center.lat, center.lng, 18);
    }
  };

  const handleZoomInClick = () => {
    if (!cameraRef.current) return;
    const newDist = Math.max(MIN_CAMERA_DIST, cameraRef.current.position.z - 25);
    cameraRef.current.position.z = newDist;
    setCameraDistance(Math.round(newDist));
    if (newDist <= MIN_CAMERA_DIST + 5 && onTransitionToMap) {
      onTransitionToMap(center.lat, center.lng, 18);
    }
  };

  const handleZoomOutClick = () => {
    if (!cameraRef.current) return;
    const newDist = Math.min(MAX_CAMERA_DIST, cameraRef.current.position.z + 25);
    cameraRef.current.position.z = newDist;
    setCameraDistance(Math.round(newDist));
  };

  const handleResetView = () => {
    rotateToCoordinates(center.lat, center.lng);
    if (cameraRef.current) {
      cameraRef.current.position.z = 175;
      setCameraDistance(175);
    }
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none cursor-grab active:cursor-grabbing font-roboto"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Three.js Canvas Container (Deep Cosmic Space) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" />

      {/* FLOATING TOP-LEFT GLOBE STATUS IN HIGH-CONTRAST LIGHT THEME */}
      <div className="absolute top-20 left-4 md:left-6 z-20 pointer-events-auto flex items-center gap-2.5 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 shadow-lg text-xs text-slate-700">
        <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-900">3D Global Earth</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.2 rounded border border-blue-200">
              Interactive Space Orbit
            </span>
          </div>
          <span className="text-[11px] text-slate-500 truncate max-w-[200px]">
            Target: {currentAddress || `${center.lat.toFixed(4)}°, ${center.lng.toFixed(4)}°`}
          </span>
        </div>
      </div>

      {/* FLOATING TOP-RIGHT ZOOM CONTROLS IN LIGHT THEME */}
      <div className="absolute top-20 right-4 md:right-6 z-20 pointer-events-auto flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-lg">
        <button
          type="button"
          onClick={handleZoomInClick}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
          title="Zoom In (Scroll to enter 2D street map)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOutClick}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-full h-px bg-slate-200 my-0.5" />
        <button
          type="button"
          onClick={handleResetView}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors"
          title="Center on Target Site"
        >
          <Compass className="w-4 h-4 text-blue-600" />
        </button>
      </div>

      {/* TOP SCROLL-UP SHORTCUT PILL TO RETURN TO DESCRIPTION SECTION */}
      {onScrollToOverview && (
        <button
          type="button"
          onClick={onScrollToOverview}
          className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-auto bg-white/95 backdrop-blur-md border border-slate-200 text-slate-700 hover:text-slate-900 px-3.5 py-1.5 rounded-full shadow-md text-xs font-medium flex items-center gap-1.5 transition-all hover:bg-slate-50 active:scale-95"
          title="Scroll up to Project Description & Methodology"
        >
          <ArrowUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Scroll to Project Description</span>
        </button>
      )}

      {/* BOTTOM-CENTER GUIDANCE PILL & TRANSITION CTA IN LIGHT THEME */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-auto flex flex-col items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 text-xs text-slate-700">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Drag to rotate Earth · Double-click to zoom in</span>
          </div>

          <div className="h-4 w-px bg-slate-200" />

          {/* Direct CTA button to dive right into Street Level Rooftop CAD */}
          <button
            type="button"
            onClick={() => onTransitionToMap && onTransitionToMap(center.lat, center.lng, 19)}
            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium px-3.5 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 text-xs active:scale-95"
          >
            <span>Zoom to Rooftop CAD</span>
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Hovered Coordinates indicator */}
        {hoveredCoords && (
          <div className="bg-white/95 backdrop-blur-sm border border-slate-200 px-3 py-1 rounded-full text-[11px] text-slate-700 shadow-md flex items-center gap-1.5 animate-fade-in">
            <MapPin className="w-3 h-3 text-blue-600" />
            <span>Hovering: {hoveredCoords.lat}° N, {hoveredCoords.lng}° E</span>
            <span className="text-slate-400">· Click to target</span>
          </div>
        )}
      </div>

      {/* DISCRETE BOTTOM-LEFT COORDINATE PILL IN LIGHT THEME */}
      <div className="absolute bottom-6 left-4 md:left-6 z-20 pointer-events-none flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-700 shadow-md">
        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
        <span className="font-medium text-slate-900">Lat: {center.lat.toFixed(4)}°</span>
        <span className="text-slate-300">|</span>
        <span className="font-medium text-slate-900">Lng: {center.lng.toFixed(4)}°</span>
      </div>

    </div>
  );
}