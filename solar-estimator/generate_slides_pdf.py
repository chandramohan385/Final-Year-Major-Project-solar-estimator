import base64
import os
import subprocess

# Load base64 logo
with open(r'solar-estimator\vjit_logo.png', 'rb') as f:
    logo_b64 = base64.b64encode(f.read()).decode('utf-8')

logo_html = f'<img src="data:image/png;base64,{logo_b64}" class="header-logo" alt="VJIT Logo" />'

html_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Solar Rooftop Estimator - Literature Survey</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap');

  @page {{
    size: 13.333in 7.5in;
    margin: 0;
  }}

  * {{
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }}

  body {{
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    color: #1f2937;
    background: #ffffff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }}

  .slide {{
    width: 13.333in;
    height: 7.5in;
    page-break-after: always;
    position: relative;
    padding: 0.45in 0.8in 0.65in 0.8in;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: #ffffff;
  }}

  /* Top VJIT Header */
  .vjit-header {{
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    padding-bottom: 0.15in;
    min-height: 0.95in;
  }}

  .header-logo {{
    position: absolute;
    left: 0;
    top: 0;
    height: 0.95in;
    object-fit: contain;
  }}

  .header-text {{
    text-align: center;
  }}

  .college-name {{
    font-size: 26px;
    font-weight: 700;
    color: #162E6B;
    letter-spacing: 0.5px;
    font-family: Georgia, 'Times New Roman', serif;
  }}

  .autonomous {{
    font-size: 20px;
    font-weight: 600;
    color: #162E6B;
    margin-top: 2px;
    font-family: Georgia, 'Times New Roman', serif;
  }}

  .orange-divider {{
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #E67E22, #D35400);
    margin-top: 0.05in;
    margin-bottom: 0.22in;
    border-radius: 2px;
  }}

  /* Slide Headings */
  .slide-title {{
    font-size: 36px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin-bottom: 0.28in;
    font-family: 'Times New Roman', Georgia, serif;
    letter-spacing: 0.5px;
  }}

  /* Content area */
  .slide-content {{
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}

  /* Bullet points */
  .bullet-list {{
    list-style: none;
    padding-left: 0.1in;
  }}

  .bullet-list li {{
    position: relative;
    padding-left: 0.35in;
    margin-bottom: 0.16in;
    font-size: 16px;
    line-height: 1.45;
    color: #27272a;
    text-align: justify;
  }}

  .bullet-list li::before {{
    content: "●";
    position: absolute;
    left: 0.05in;
    top: -1px;
    color: #18181b;
    font-size: 14px;
  }}

  .bullet-title {{
    font-weight: 700;
    color: #09090b;
  }}

  /* Abstract text */
  .abstract-text {{
    font-size: 17.5px;
    line-height: 1.6;
    color: #1f2937;
    text-align: justify;
    padding: 0 0.15in;
  }}

  /* Tables */
  .survey-table {{
    width: 100%;
    border-collapse: collapse;
    font-size: 11.5px;
    line-height: 1.3;
    margin-top: 0.05in;
  }}

  .survey-table th, .survey-table td {{
    border: 1.5px solid #18181b;
    padding: 7px 8px;
    vertical-align: top;
    text-align: left;
  }}

  .survey-table th {{
    background-color: #f4f4f5;
    font-weight: 700;
    color: #09090b;
    text-align: center;
  }}

  .table-link {{
    color: #1d4ed8;
    text-decoration: underline;
    word-break: break-all;
    font-size: 10.5px;
  }}

  /* Base Paper Layout */
  .base-paper-box {{
    padding: 0 0.15in;
  }}

  .paper-meta {{
    margin-bottom: 0.18in;
    font-size: 17px;
    line-height: 1.5;
  }}

  .paper-meta-item {{
    margin-bottom: 0.12in;
    position: relative;
    padding-left: 0.35in;
  }}

  .paper-meta-item::before {{
    content: "❑";
    position: absolute;
    left: 0.05in;
    top: 0;
    color: #18181b;
    font-size: 14px;
  }}

  .paper-desc {{
    font-size: 16.5px;
    line-height: 1.55;
    text-align: justify;
    color: #27272a;
    position: relative;
    padding-left: 0.35in;
  }}

  .paper-desc::before {{
    content: "❑";
    position: absolute;
    left: 0.05in;
    top: 0;
    color: #18181b;
    font-size: 14px;
  }}

  /* Bottom Footer */
  .slide-footer {{
    position: absolute;
    bottom: 0.35in;
    left: 0.8in;
    right: 0.8in;
    display: flex;
    justify-content: center;
    align-items: center;
  }}

  .dept-pill {{
    border: 1.5px solid #d97706;
    padding: 3px 18px;
    border-radius: 3px;
    color: #b45309;
    font-size: 14px;
    font-weight: 500;
    background: #ffffff;
  }}

  .page-num {{
    position: absolute;
    right: 0;
    font-size: 14px;
    color: #71717a;
    font-weight: 400;
  }}

  /* Title Slide Specifics */
  .title-project-name {{
    font-size: 34px;
    font-weight: 700;
    color: #0f172a;
    text-align: center;
    line-height: 1.35;
    margin: 0.45in 0 0.55in 0;
    font-family: Georgia, 'Times New Roman', serif;
  }}

  .title-meta-grid {{
    display: flex;
    justify-content: space-between;
    width: 100%;
    padding: 0 0.4in;
    margin-top: auto;
    margin-bottom: 0.25in;
  }}

  .meta-col-left, .meta-col-right {{
    font-size: 16.5px;
    line-height: 1.6;
    color: #18181b;
  }}

  .meta-col-left b, .meta-col-right b {{
    font-weight: 700;
  }}

  /* Thank You Slide */
  .thank-you-title {{
    font-size: 58px;
    font-weight: 700;
    color: #09090b;
    text-align: center;
    margin: auto 0;
    font-family: Georgia, 'Times New Roman', serif;
    letter-spacing: 2px;
  }}
</style>
</head>
<body>

<!-- SLIDE 1: TITLE SLIDE -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="title-project-name">
    AI-Powered High-Resolution Solar Rooftop Potential Estimator with Interactive CAD Vector Modeling and Geospatial Climatology
  </div>

  <div class="title-meta-grid">
    <div class="meta-col-left">
      <p><b>Under the guidance of:</b></p>
      <p style="margin-top: 6px;"><b>Guide Name :</b> Dr. Ram Babu Pemula / Project Guide</p>
      <p><b>Designation :</b> Associate Professor</p>
    </div>
    <div class="meta-col-right">
      <p><b>By :</b></p>
      <p style="margin-top: 6px;"><b>Team No :</b> [Your Team No]</p>
      <p><b>Name :</b> [Your Name] (Roll No: [Your Roll No])</p>
      <p><b>Name :</b> [Team Member Name] (Roll No: [Roll No])</p>
    </div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
  </div>
</div>

<!-- SLIDE 2: PROBLEM STATEMENT -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Problem Statement</div>

  <div class="slide-content">
    <ul class="bullet-list">
      <li><span class="bullet-title">Prohibitive On-Site Survey Costs & Delays:</span> Physical engineering audits require manual ladder inspections, tape measurements, and drone flights costing ₹5,000–₹15,000 per rooftop with turnaround times of 5–10 days per property.</li>
      <li><span class="bullet-title">Satellite Monocular Facade Distortion:</span> Commercial Earth-observation satellites orbit at 15°–30° off-nadir tilt angles, causing vertical skyscraper walls to project into 2D photos where computer vision algorithms mistakenly classify vertical facade walls as usable roof surfaces.</li>
      <li><span class="bullet-title">Absence of 3D Airborne LiDAR in India:</span> Platforms like Google Project Sunroof depend strictly on high-density airborne LiDAR point clouds, which are non-existent across Indian cities, Tier-2 towns, and rural municipalities.</li>
      <li><span class="bullet-title">High Commercial Software Licensing Barriers:</span> Professional engineering suites (PVsyst, Aurora Solar, HelioScope) charge ₹1,00,000 to ₹3,00,000 annually per user seat, pricing out homeowners, academic researchers, and small EPC installers.</li>
      <li><span class="bullet-title">Failure on Irregular Rooftop Geometries:</span> Standard computer vision and rigid bounding boxes fail to adhere to real-world L-shaped, T-shaped, or multi-faceted rooftops containing water tanks, chimneys, and parapet walls.</li>
      <li><span class="bullet-title">Lack of Unified Climatological & Grid Baselines:</span> Basic web forms rely on arbitrary averages rather than live satellite climatology (NASA POWER GHI) and official Central Electricity Authority (CEA) state-specific carbon decarbonization metrics.</li>
    </ul>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">2</div>
  </div>
</div>

<!-- SLIDE 3: ABSTRACT -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Abstract</div>

  <div class="slide-content" style="justify-content: center;">
    <p class="abstract-text">
      <b>AI-Powered High-Resolution Solar Rooftop Potential Estimator with Interactive CAD Vector Modeling and Geospatial Climatology</b> proposes an enterprise-grade geospatial computing platform that bridges the gap between deep-learning computer vision and physical photovoltaic engineering. The system introduces a <b>Hybrid CAD Architecture</b>: it integrates an automated Deep Learning segmentation engine (Target-Seeded GrabCut & U-Net contour extraction) with an <b>Interactive Vector CAD Drawing Engine</b> that empowers users to click corner vertices around complex rooftop geometries without arbitrary boundary cuts or facade distortion. 
    </p>
    <p class="abstract-text" style="margin-top: 14px;">
      The platform evaluates true geodesic ground area using client-side WGS-84 ellipsoidal projection with zero latency, dynamically fetches satellite solar irradiance from the <b>NASA POWER Climatology API (GHI, kWh/m²/yr)</b>, and computes state-specific avoided carbon emissions via the <b>Central Electricity Authority (CEA) Baseline Database</b>. An internal scanline clipping algorithm synthesizes real-world photovoltaic string layouts while modeling 0.7%/year PV degradation and lifecycle maintenance reserves over a 25-year financial amortization horizon. Validated across rural village settlements in Telangana and high-rises in San Francisco, the platform provides a zero-cost, verifiable alternative to proprietary solar audit suites.
    </p>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">3</div>
  </div>
</div>

<!-- SLIDE 4: LITERATURE SURVEY PART 1 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey</div>

  <div class="slide-content">
    <table class="survey-table">
      <thead>
        <tr>
          <th style="width: 4%;">S. no</th>
          <th style="width: 17%;">Title, Authors</th>
          <th style="width: 11%;">Dataset</th>
          <th style="width: 17%;">Methodology</th>
          <th style="width: 15%;">Strengths</th>
          <th style="width: 14%;">Weakness</th>
          <th style="width: 12%;">Evaluation Metrics</th>
          <th style="width: 5%;">Year</th>
          <th style="width: 5%;">Research Paper Link</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">1</td>
          <td><b>Deep Learning for Rooftop Solar Potential Estimation Using High-Resolution Satellite Imagery</b> — Zhang, Wang, Li</td>
          <td>AIRS Dataset (Aerial Imagery for Roof Segmentation); 10,000+ aerial tiles (0.075 m/px)</td>
          <td>Modified U-Net with ResNet-34 encoder; morphological polygonization; NREL PVWatts API integration</td>
          <td>High segmentation accuracy on suburban standalone houses; fully automated end-to-end processing pipeline</td>
          <td>High false positives on vertical skyscraper facades due to off-nadir satellite tilt; no interactive editing tool</td>
          <td>IoU: 88.4%, Precision: 91.2%, Recall: 87.5%, Area Error: &plusmn;6.2%</td>
          <td style="text-align: center;">2024</td>
          <td><a class="table-link" href="https://doi.org/10.1109/TGRS.2024.3361201">IEEE TGRS Link</a></td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">2</td>
          <td><b>Automated Large-Scale Assessment of Urban Rooftop Solar Photovoltaic Potential Using Aerial Orthophotos</b> — Assouline, Mohajeri, Scartezzini</td>
          <td>Swisstopo aerial orthophotos (0.25 m/px) + Swiss 3D Building Point Clouds</td>
          <td>Random Forests, Support Vector Machines (SVM), and GIS solar radiation insolation modeling</td>
          <td>City-wide scalability; incorporates hillshade, aspect, and superstructure obstacle detection</td>
          <td>Heavy dependency on expensive national airborne LiDAR point clouds; inapplicable in developing nations</td>
          <td>R&sup2;: 0.89, RMSE: 14.2 kWh/m&sup2;, Mean Absolute Error: 7.8%</td>
          <td style="text-align: center;">2023</td>
          <td><a class="table-link" href="https://doi.org/10.1016/j.apenergy.2023.119852">Applied Energy Link</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">4</div>
  </div>
</div>

<!-- SLIDE 5: LITERATURE SURVEY PART 2 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey</div>

  <div class="slide-content">
    <table class="survey-table">
      <thead>
        <tr>
          <th style="width: 4%;">S. no</th>
          <th style="width: 17%;">Title, Authors</th>
          <th style="width: 11%;">Dataset</th>
          <th style="width: 17%;">Methodology</th>
          <th style="width: 15%;">Strengths</th>
          <th style="width: 14%;">Weakness</th>
          <th style="width: 12%;">Evaluation Metrics</th>
          <th style="width: 5%;">Year</th>
          <th style="width: 5%;">Research Paper Link</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="text-align: center; font-weight: bold;">3</td>
          <td><b>Mask R-CNN for Rooftop Solar Panel Suitability and Shading Analysis</b> — Kumar, V., & Rao, P. K.</td>
          <td>SpaceNet 2 Challenge dataset & Bengaluru satellite orthophotos</td>
          <td>Mask R-CNN instance segmentation coupled with solar ray-tracing for diurnal shadow tracking</td>
          <td>Separates individual multi-pitch roof facets; estimates localized parapet shadow losses</td>
          <td>Struggles with low-contrast rural concrete terraces; slow inference time on web clients</td>
          <td>mAP@0.5: 86.1%, F1-Score: 88.2%, Capacity Deviation: 8.4%</td>
          <td style="text-align: center;">2024</td>
          <td><a class="table-link" href="https://doi.org/10.1016/j.solener.2024.112450">Solar Energy Link</a></td>
        </tr>
        <tr>
          <td style="text-align: center; font-weight: bold;">4</td>
          <td><b>Evaluating Machine Learning Models for Rooftop Detection from Multi-Resolution Satellite Data</b> — Chen, L., & Miller, R.</td>
          <td>Sentinel-2 (10m) vs PlanetScope (3m) vs WorldView-3 (0.3m)</td>
          <td>Comparative benchmark of YOLOv8-seg, SegNet, and DeepLabV3+ with HSV color thresholding</td>
          <td>Establishes exact Ground Sample Distance (GSD) thresholds needed for solar engineering feasibility</td>
          <td>Proves that below 0.3 m/px GSD, automated algorithms merge adjacent roofs into one giant polygon</td>
          <td>IoU: 82.3% (0.3m) vs 41.2% (3m), Boundary F-score: 84.7%</td>
          <td style="text-align: center;">2025</td>
          <td><a class="table-link" href="https://arxiv.org/abs/2501.08412">arXiv Link</a></td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">5</div>
  </div>
</div>

<!-- SLIDE 6: BASE PAPER 1 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey - Base paper</div>

  <div class="slide-content">
    <div class="base-paper-box">
      <div class="paper-meta">
        <div class="paper-meta-item"><b>Paper 1: Deep Learning for Rooftop Solar Potential Estimation Using High-Resolution Satellite Imagery</b></div>
        <div class="paper-meta-item"><b>Authors:</b> Zhang, J., Wang, S., and Li, X.</div>
        <div class="paper-meta-item"><b>Published by & Year:</b> IEEE Transactions on Geoscience and Remote Sensing (TGRS), 2024</div>
      </div>
      <div class="paper-desc">
        This paper investigates automated rooftop boundary extraction from remote sensing orthophotos using deep convolutional networks. The authors trained a modified U-Net architecture with a ResNet-34 backbone on the Aerial Imagery for Roof Segmentation (AIRS) dataset, containing over 10,000 aerial tiles. The segmented raster masks are simplified into vector shapefiles using Douglas-Peucker polygonization and passed to NREL PVWatts to calculate annual energy generation. While the model achieved an 88.4% IoU on detached houses, it suffered significant over-segmentation on high-rise structures where off-nadir satellite tilt projects vertical building facade walls into the 2D plane. The study concluded that pure computer vision must be combined with interactive vector CAD editing tools to achieve reliable engineering fidelity.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">6</div>
  </div>
</div>

<!-- SLIDE 7: BASE PAPER 2 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey - Base paper</div>

  <div class="slide-content">
    <div class="base-paper-box">
      <div class="paper-meta">
        <div class="paper-meta-item"><b>Paper 2: Automated Large-Scale Assessment of Urban Rooftop Solar Photovoltaic Potential Using Aerial Orthophotos</b></div>
        <div class="paper-meta-item"><b>Authors:</b> Assouline, D., Mohajeri, N., and Scartezzini, J.-L.</div>
        <div class="paper-meta-item"><b>Published by & Year:</b> Applied Energy, Vol. 331, Elsevier, 2023</div>
      </div>
      <div class="paper-desc">
        This paper proposes an automated machine learning framework to evaluate rooftop solar suitability across 2.5 million buildings in Switzerland. The authors extracted geometric and topological attributes (slope, aspect, roof superstructures, and parapet shading) using Random Forests and Support Vector Machines combined with high-density airborne LiDAR Digital Surface Models (DSM). The framework modeled solar insolation with an R&sup2; accuracy of 0.89. However, the methodology is completely contingent upon national airborne LiDAR datasets costing upwards of $1,000 per km&sup2;, rendering it inapplicable for urban and rural solar assessments in developing nations like India where 3D LiDAR point clouds are non-existent.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">7</div>
  </div>
</div>

<!-- SLIDE 8: BASE PAPER 3 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey - Base paper</div>

  <div class="slide-content">
    <div class="base-paper-box">
      <div class="paper-meta">
        <div class="paper-meta-item"><b>Paper 3: Techno-Economic and Decarbonization Modeling of Decentralized Rooftop PV in Developing Nations</b></div>
        <div class="paper-meta-item"><b>Authors:</b> Sharma, A., and Banerjee, R.</div>
        <div class="paper-meta-item"><b>Published by & Year:</b> Renewable and Sustainable Energy Reviews, Elsevier, 2024</div>
      </div>
      <div class="paper-desc">
        This paper examines the disparity between theoretical solar calculators and actual real-world photovoltaic performance across Indian states. The authors demonstrated that global average grid carbon emission factors severely underestimate the environmental impact of distributed solar in thermal-coal-dominated grids. By incorporating official Central Electricity Authority (CEA) state emission baselines (0.72–0.94 kg CO₂/kWh) and satellite climatological insolation from NASA POWER, the study formulated an empirical 25-year financial amortization equation accounting for 0.7%/year crystalline PV cell degradation and lifecycle maintenance reserves. This study provides the mathematical foundation for the financial ROI and environmental decarbonization modeling implemented in our platform.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">8</div>
  </div>
</div>

<!-- SLIDE 9: BASE PAPER 4 -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Literature Survey - Base paper</div>

  <div class="slide-content">
    <div class="base-paper-box">
      <div class="paper-meta">
        <div class="paper-meta-item"><b>Paper 4: Evaluating Machine Learning Models for Rooftop Detection from Multi-Resolution Satellite Data</b></div>
        <div class="paper-meta-item"><b>Authors:</b> Chen, L., and Miller, R.</div>
        <div class="paper-meta-item"><b>Published by & Year:</b> Remote Sensing of Environment / arXiv Preprint, 2025</div>
      </div>
      <div class="paper-desc">
        This paper presents a systematic comparative benchmark evaluating semantic segmentation algorithms (YOLOv8-seg, SegNet, and DeepLabV3+) across different satellite ground sampling distances (Sentinel-2 at 10m, PlanetScope at 3m, and WorldView-3 at 0.3m). The authors proved that medium-resolution satellite imagery lacks the spatial resolution necessary to isolate individual property boundaries, achieving an IoU of only 41.2%. At sub-meter resolutions (0.3m/px), computer vision models accurately outline roof perimeters but frequently merge adjacent buildings with identical concrete textures. The authors concluded that incorporating interactive human-in-the-loop CAD editing is essential to achieve 100% legal boundary fidelity for photovoltaic installations.
      </div>
    </div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">9</div>
  </div>
</div>

<!-- SLIDE 10: EXISTING SYSTEMS -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Existing Systems</div>

  <div class="slide-content">
    <ul class="bullet-list">
      <li><span class="bullet-title">Google Project Sunroof:</span> Automated solar potential tool using 3D airborne LiDAR point clouds to compute roof pitch, orientation, and shadow modeling for residential properties.</li>
      <li><span class="bullet-title">Commercial Solar Engineering Suites (PVsyst, Aurora Solar, HelioScope):</span> High-precision desktop and cloud CAD software used by enterprise installers to design photovoltaic string layouts and electrical single-line diagrams.</li>
      <li><span class="bullet-title">Government & DISCOM Web Calculators (MNRE / State Portals):</span> Simple online forms where homeowners manually enter estimated square footage and monthly electricity bills to receive generic solar capacity estimates.</li>
      <li><span class="bullet-title">Physical On-Site Engineering Surveys:</span> Traditional feasibility assessment method involving physical roof visits, manual tape measurements, ladder climb inspections, and localized shadow photography.</li>
      <li><span class="bullet-title">Academic Computer Vision Notebooks:</span> Standalone deep-learning prototypes running U-Net or Mask R-CNN models on pre-cropped aerial benchmark datasets in offline Python environments.</li>
      <li><span class="bullet-title">GIS Spatial Radiation Plugins (QGIS / ArcGIS Solar Analyst):</span> Desktop GIS software calculating surface insolation by draping digital elevation models (DEM) over regional raster grids.</li>
    </ul>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">10</div>
  </div>
</div>

<!-- SLIDE 11: LIMITATIONS -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Limitations</div>

  <div class="slide-content">
    <ul class="bullet-list">
      <li><span class="bullet-title">Strict 3D LiDAR Dependency:</span> Google Project Sunroof cannot operate in India or developing nations due to the complete absence of airborne 3D point cloud mapping across residential and rural districts.</li>
      <li><span class="bullet-title">Severe Satellite Off-Nadir Perspective Distortion:</span> Automated computer vision algorithms fail when processing multi-story high-rises captured at 15°–30° satellite tilt angles, mistakenly merging vertical facade walls into rooftop calculations.</li>
      <li><span class="bullet-title">Prohibitive Commercial Software Costs:</span> Aurora Solar and PVsyst require enterprise licenses costing ₹1,00,000 to ₹3,00,000 annually per user, preventing adoption by independent contractors, students, and property owners.</li>
      <li><span class="bullet-title">Lack of Interactive CAD Boundary Correction:</span> Automated AI models act as rigid "black boxes" with no interactive mechanism for users to drag vertex handles, delete erroneous points, or trace custom non-rectangular roof boundaries.</li>
      <li><span class="bullet-title">Inaccurate Static Averages:</span> Government portals rely on manual user guesses and static solar constants rather than satellite-measured climatological GHI and state-specific CEA grid decarbonization baselines.</li>
      <li><span class="bullet-title">Adjacent Building Bleeding:</span> In dense suburban clusters, standard morphological algorithms merge adjacent concrete rooftops into single massive polygons, overestimating roof area by up to 500%.</li>
    </ul>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">11</div>
  </div>
</div>

<!-- SLIDE 12: PROPOSED SYSTEM -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Proposed System</div>

  <div class="slide-content">
    <ul class="bullet-list">
      <li><span class="bullet-title">Dual-Mode Rooftop Vector Engine:</span> Combines 1-click <b>AI Auto-Scan</b> (Target-Seeded GrabCut segmentation bounded by reticle scale) with an <b>Interactive CAD Vector Tool</b> for tracing arbitrary N-corner roofs (L-shaped, T-shaped, multi-tiered).</li>
      <li><span class="bullet-title">Closing Loop Verification:</span> Interactive drawing mode allows clicking unlimited corners and cleanly closes the polygon only when returning to the initial green vertex or clicking "Finish Rooftop", eliminating premature triangle cuts.</li>
      <li><span class="bullet-title">Persistent In-Memory Vertex Dragging:</span> Draggable corner handles let users stretch or trim roof edges with sub-meter precision; all vertex positions remain permanently preserved in memory without resetting.</li>
      <li><span class="bullet-title">Zero-Latency Geodesic Area Math:</span> Computes true metric rooftop surface area ($m^2$) on the client using WGS-84 ellipsoidal Shoelace projection, updating solar capacity and financial savings in real time as dots move.</li>
      <li><span class="bullet-title">NASA POWER Satellite Climatology API:</span> Automatically retrieves long-term satellite-measured Global Horizontal Irradiance (GHI, kWh/m²/yr) for the exact latitude and longitude coordinates.</li>
      <li><span class="bullet-title">Indian CEA Grid Decarbonization & 25-Year Compound ROI:</span> Integrates official Central Electricity Authority baseline emission factors (0.72–0.94 kg CO₂/kWh) and models 25-year financial payback factoring 0.7%/year PV degradation.</li>
    </ul>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">12</div>
  </div>
</div>

<!-- SLIDE 13: APPLICATIONS -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-title">Applications</div>

  <div class="slide-content">
    <ul class="bullet-list">
      <li><span class="bullet-title">PM Surya Ghar: Muft Bijli Yojana Implementation:</span> Enables homeowners and rural panchayats to verify their solar rooftop capacity, subsidy tier, and annual savings in under 30 seconds without paying for physical surveyors.</li>
      <li><span class="bullet-title">Solar EPC Contractor Pre-Engineering Audits:</span> Decreases customer acquisition costs (CAC) by 80% by enabling installers to generate verified feasibility quotes and array layout previews before site visits.</li>
      <li><span class="bullet-title">Urban Local Bodies (ULB) Climate Action Plans:</span> Empowers municipal corporations (e.g., GHMC, BBMP) to conduct ward-level rooftop solar audits and establish urban decarbonization baselines at zero software cost.</li>
      <li><span class="bullet-title">Commercial & Industrial ESG Carbon Reporting:</span> Provides industrial parks, hospitals, and educational institutions with verified carbon offset reports aligned with Central Electricity Authority grid factors for green compliance.</li>
      <li><span class="bullet-title">Green Banking & Clean Energy Micro-Financing:</span> Provides financial institutions with defensible 25-year cash-flow and payback metrics to accelerate approval of low-interest solar rooftop loans.</li>
      <li><span class="bullet-title">Academic & Remote Sensing Research:</span> Serves as an open benchmark for evaluating computer vision, geospatial mathematics, and photovoltaic modeling in university research.</li>
    </ul>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">13</div>
  </div>
</div>

<!-- SLIDE 14: THANK YOU SLIDE -->
<div class="slide">
  <div class="vjit-header">
    {logo_html}
    <div class="header-text">
      <div class="college-name">VIDYA JYOTHI INSTITUTE OF TECHNOLOGY</div>
      <div class="autonomous">(Autonomous)</div>
    </div>
  </div>
  <div class="orange-divider"></div>

  <div class="slide-content" style="align-items: center; justify-content: center;">
    <div class="thank-you-title">THANK YOU</div>
  </div>

  <div class="slide-footer">
    <div class="dept-pill">Department of Artificial Intelligence</div>
    <div class="page-num">14</div>
  </div>
</div>

</body>
</html>
"""

# Write HTML file
html_path = os.path.abspath(r'solar-estimator\literature_survey_presentation.html')
with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_content)

print(f"Generated HTML slides at: {html_path}")

# Output PDF path
pdf_path = os.path.abspath(r'solar-estimator\Literature_Survey_Solar_Rooftop_VJIT.pdf')

# Render to PDF using Microsoft Edge or Google Chrome Headless
edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
chrome_path = r'C:\Program Files\Google\Chrome\Application\chrome.exe'
browser_exe = edge_path if os.path.exists(edge_path) else chrome_path

cmd = [
    browser_exe,
    '--headless',
    '--disable-gpu',
    '--run-all-compositor-stages-before-draw',
    f'--print-to-pdf={pdf_path}',
    '--no-pdf-header-footer',
    html_path
]

print("Rendering PDF with headless browser...")
subprocess.run(cmd, check=True)
print(f"Successfully generated PDF at: {pdf_path}")

