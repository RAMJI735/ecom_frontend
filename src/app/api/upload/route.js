import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") || formData.get("image");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        { success: false, message: "No valid image file found in FormData" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.cloud_name ||
      "dv2rmuhxl";
    const apiKey =
      process.env.CLOUDINARY_API_KEY ||
      process.env.cloudinary_key ||
      "397355892565452";
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET ||
      process.env.cloudinary_secret ||
      "fmj5QX2EzJbhgwSFJVsLtsu_TC4";

    const timestamp = Math.round(Date.now() / 1000);
    const signatureStr = `timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const cloudForm = new globalThis.FormData();
    cloudForm.append("file", dataUri);
    cloudForm.append("api_key", apiKey);
    cloudForm.append("timestamp", String(timestamp));
    cloudForm.append("signature", signature);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: cloudForm,
      }
    );

    const result = await cloudRes.json();

    if (!cloudRes.ok) {
      console.error("Cloudinary upload failed:", result);
      return NextResponse.json(
        {
          success: false,
          message: result?.error?.message || "Cloudinary upload failed",
        },
        { status: cloudRes.status || 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      public_id: result.public_id,
      data: {
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error("Upload route error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to process image upload",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const target = body.publicId || body.public_id || body.url;
    if (!target) {
      return NextResponse.json(
        { success: false, message: "Target publicId or url is required" },
        { status: 400 }
      );
    }

    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ||
      process.env.cloud_name ||
      "dv2rmuhxl";
    const apiKey =
      process.env.CLOUDINARY_API_KEY ||
      process.env.cloudinary_key ||
      "397355892565452";
    const apiSecret =
      process.env.CLOUDINARY_API_SECRET ||
      process.env.cloudinary_secret ||
      "fmj5QX2EzJbhgwSFJVsLtsu_TC4";

    let publicId = target;
    if (target.includes("http")) {
      const match = target.match(/\/upload\/(?:v\d+\/)?([^\.]+)/);
      publicId = match ? match[1] : null;
    }

    if (!publicId) {
      return NextResponse.json({
        success: true,
        message: "No Cloudinary asset found to delete",
      });
    }

    const timestamp = Math.round(Date.now() / 1000);
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureStr).digest("hex");

    const cloudForm = new globalThis.FormData();
    cloudForm.append("public_id", publicId);
    cloudForm.append("api_key", apiKey);
    cloudForm.append("timestamp", String(timestamp));
    cloudForm.append("signature", signature);

    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      {
        method: "POST",
        body: cloudForm,
      }
    );

    const result = await cloudRes.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Cloudinary delete route error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
