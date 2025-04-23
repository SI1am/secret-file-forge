
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.33.2";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get request body
    const body = await req.json();
    const { fileId, action, options } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "File ID is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Create Supabase client with Auth context of the function
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: req.headers.get("Authorization")! } },
      }
    );

    // Get the file data
    const { data: file, error: fetchError } = await supabaseClient
      .from("files")
      .select("*")
      .eq("id", fileId)
      .single();

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: "File not found", details: fetchError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Get user ID for activity logging
    const { data: { user } } = await supabaseClient.auth.getUser();
    const userId = user?.id;

    // Process the file based on the action
    switch (action) {
      case "watermark": {
        // Check if watermark text is provided
        if (!options?.watermarkText) {
          return new Response(
            JSON.stringify({ error: "Watermark text is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // For static watermarking - update metadata
        const watermarkData = {
          text: options.watermarkText,
          position: options.position || "center",
          opacity: options.opacity || 0.5,
          visible: options.visible !== undefined ? options.visible : true,
          type: options.dynamic ? "dynamic" : "static",
          timestamp: new Date().toISOString()
        };
        
        // For dynamic watermarking, we would actually process the image here
        // This would involve image manipulation which is beyond this function's scope
        // In a real implementation, we would use an image processing library
        
        // Update the file in the database
        const { data: updatedFile, error: updateError } = await supabaseClient
          .from("files")
          .update({
            has_watermark: true,
            watermark_data: watermarkData
          })
          .eq("id", fileId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update file", details: updateError }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        // Log activity
        if (userId) {
          await supabaseClient
            .from("activity_logs")
            .insert({
              user_id: userId,
              action: "watermark",
              resource_id: fileId,
              resource_type: "file",
              details: {
                watermarkText: options.watermarkText,
                watermarkType: options.dynamic ? "dynamic" : "static"
              }
            });
        }

        return new Response(
          JSON.stringify({ success: true, file: updatedFile }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "masking": {
        if (!options?.maskingConfig) {
          return new Response(
            JSON.stringify({ error: "Masking configuration is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }
        
        // Update the file with masking data
        const { data: updatedFile, error: updateError } = await supabaseClient
          .from("files")
          .update({
            is_masked: true,
            masking_config: options.maskingConfig
          })
          .eq("id", fileId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update file", details: updateError }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        // Log activity
        if (userId) {
          await supabaseClient
            .from("activity_logs")
            .insert({
              user_id: userId,
              action: "masking",
              resource_id: fileId,
              resource_type: "file",
              details: {
                masking_config: options.maskingConfig
              }
            });
        }

        return new Response(
          JSON.stringify({ success: true, file: updatedFile }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      case "share": {
        if (!options?.shareWith) {
          return new Response(
            JSON.stringify({ error: "Share with email is required" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
          );
        }

        // Get current shared_with array
        const currentSharedWith = file.shared_with || [];
        const newSharedWith = [...currentSharedWith];
        
        // Add the email if it's not already in the array
        if (!newSharedWith.includes(options.shareWith)) {
          newSharedWith.push(options.shareWith);
        }

        // Update the file in the database
        const { data: updatedFile, error: updateError } = await supabaseClient
          .from("files")
          .update({
            shared_with: newSharedWith
          })
          .eq("id", fileId)
          .select()
          .single();

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update file", details: updateError }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
          );
        }

        // Log activity
        if (userId) {
          await supabaseClient
            .from("activity_logs")
            .insert({
              user_id: userId,
              action: "shared",
              resource_id: fileId,
              resource_type: "file",
              details: {
                shared_with: options.shareWith
              }
            });
        }

        return new Response(
          JSON.stringify({ success: true, file: updatedFile }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: "Unsupported action" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
