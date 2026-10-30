"""
Lightweight U-Net PyTorch Architecture for Building & Rooftop Segmentation.
Matches Massachusetts Buildings & Inria Aerial dataset topologies.
"""
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

if HAS_TORCH:
    class DoubleConv(nn.Module):
        """(convolution => [BN] => ReLU) * 2"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.double_conv = nn.Sequential(
                nn.Conv2d(in_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True),
                nn.Conv2d(out_channels, out_channels, kernel_size=3, padding=1, bias=False),
                nn.BatchNorm2d(out_channels),
                nn.ReLU(inplace=True)
            )

        def forward(self, x):
            return self.double_conv(x)

    class Down(nn.Module):
        """Downscaling with maxpool then double conv"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.maxpool_conv = nn.Sequential(
                nn.MaxPool2d(2),
                DoubleConv(in_channels, out_channels)
            )

        def forward(self, x):
            return self.maxpool_conv(x)

    class Up(nn.Module):
        """Upscaling then double conv"""
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.up = nn.Upsample(scale_factor=2, mode='bilinear', align_corners=True)
            self.conv = DoubleConv(in_channels, out_channels)

        def forward(self, x1, x2):
            x1 = self.up(x1)
            diffY = x2.size()[2] - x1.size()[2]
            diffX = x2.size()[3] - x1.size()[3]
            x1 = F.pad(x1, [diffX // 2, diffX - diffX // 2, diffY // 2, diffY - diffY // 2])
            x = torch.cat([x2, x1], dim=1)
            return self.conv(x)

    class OutConv(nn.Module):
        def __init__(self, in_channels, out_channels):
            super().__init__()
            self.conv = nn.Conv2d(in_channels, out_channels, kernel_size=1)

        def forward(self, x):
            return self.conv(x)

    class LightweightUNet(nn.Module):
        """
        Lightweight U-Net model:
        Input: (B, 3, 512, 512)
        Output: (B, 1, 512, 512) Logits
        """
        def __init__(self, n_channels=3, n_classes=1):
            super(LightweightUNet, self).__init__()
            self.n_channels = n_channels
            self.n_classes = n_classes

            self.inc = DoubleConv(n_channels, 32)
            self.down1 = Down(32, 64)
            self.down2 = Down(64, 128)
            self.down3 = Down(128, 256)
            self.up1 = Up(256 + 128, 128)
            self.up2 = Up(128 + 64, 64)
            self.up3 = Up(64 + 32, 32)
            self.outc = OutConv(32, n_classes)

        def forward(self, x):
            x1 = self.inc(x)
            x2 = self.down1(x1)
            x3 = self.down2(x2)
            x4 = self.down3(x3)
            x = self.up1(x4, x3)
            x = self.up2(x, x2)
            x = self.up3(x, x1)
            logits = self.outc(x)
            return logits
else:
    class LightweightUNet:
        pass
