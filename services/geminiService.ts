
import { GoogleGenAI, Type } from "@google/genai";
import { LightingSettings, FabricType, BackgroundOption, ModelMode, ModelGender, CompositionType, GarmentType, CustomBackground, FitType } from "../types";

// Removed global ai instance to ensure we always get the latest API_KEY from process.env inside functions

/**
 * Generates Gen Z focused ad copy based on the image.
 * Uses a multimodal model to understand the image context.
 */
export const generateAdCopy = async (base64Image: string, mimeType: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are a social media manager for a hype streetwear brand. The audience is Gen Z youth who love hoodies, loose-fit t-shirts, and cargos.
    
    Generate 5 distinct ad copy options for the provided clothing image:
    1. 'witty': Use heavy internet slang (drip, no cap, bet, vibe check), emojis, and be high energy/funny.
    2. 'edgy': Darker, rebellious, mysterious tone. Short, punchy sentences. Focus on non-conformity.
    3. 'minimalist': Focus purely on the "clean" aesthetic, comfort, fit, and materials. Relaxed and effortless tone.
    4. 'sarcastic': Deadpan, self-aware, roasting the consumer slightly or mocking hype culture while selling it.
    5. 'aspirational': High-status, expensive feel, "you have made it" vibe, focus on exclusivity and lifestyle.
    
    Output JSON.
  `;

  const adCopyProperties = {
    headline: { type: Type.STRING, description: "A hook appropriate for the specific style." },
    body: { type: Type.STRING, description: "Caption text." },
    hashtags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 relevant trending hashtags." }
  };

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: mimeType } },
        { text: "Analyze this item and write ad copy variations." },
      ],
    },
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          witty: { type: Type.OBJECT, properties: adCopyProperties, required: ["headline", "body", "hashtags"] },
          edgy: { type: Type.OBJECT, properties: adCopyProperties, required: ["headline", "body", "hashtags"] },
          minimalist: { type: Type.OBJECT, properties: adCopyProperties, required: ["headline", "body", "hashtags"] },
          sarcastic: { type: Type.OBJECT, properties: adCopyProperties, required: ["headline", "body", "hashtags"] },
          aspirational: { type: Type.OBJECT, properties: adCopyProperties, required: ["headline", "body", "hashtags"] }
        },
        required: ["witty", "edgy", "minimalist", "sarcastic", "aspirational"],
      },
    },
  });

  return response.text ? JSON.parse(response.text) : null;
};

/**
 * Helper: Defines the "Luxury Director" logic for composition.
 * Enforces strict Golden Ratio / Phi Grid adherence for that "High Fashion" look.
 */
const getLuxuryCompositionStrategy = (): string => {
    return `
    COMPOSITION & CINEMATOGRAPHY (DEFAULT: PRODUCT FOCUS):
    - **Lens**: 85mm Prime Lens (Virtual equivalent). Best for product isolation without distortion.
    - **Aperture**: f/4.0 to f/5.6. Sharp focus on the entire garment structure.
    - **Focus**: SHARP FOCUS on the textile. No blur on the product itself.
    - **Framing**: Center the garment. Maintain the aspect ratio of the garment's silhouette.
    - **Camera Angle**: Eye-level (0 degrees).
    `;
};

/**
 * Extracts the main clothing item and generates a hyper 3D render.
 * - Uses 'gemini-2.5-flash-image' for Ghost Mannequin (Speed/Shape focus).
 * - Uses 'gemini-3-pro-image-preview' for Human Model (High Fidelity/Realism focus).
 */
export const generate3DClothing = async (
  base64Image: string, 
  mimeType: string,
  lighting: LightingSettings,
  fabricType: FabricType,
  garmentType: GarmentType,
  fitType: FitType,
  secondaryFabricType: FabricType | 'none' = 'none',
  background: BackgroundOption = 'minimal_luxury',
  modelMode: ModelMode = 'ghost',
  modelGender: ModelGender = 'neutral',
  composition: CompositionType = 'golden_ratio',
  customBackground?: CustomBackground // New optional parameter
): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // SELECT MODEL BASED ON TASK
  const model = modelMode === 'human' ? "gemini-3-pro-image-preview" : "gemini-2.5-flash-image";

  // Light Source Mapping to Photography Terms
  let mainLightDesc = "";
  if (modelMode === 'human') {
      const directionMap: any = {
          'front': 'Butterfly Lighting',
          'left': 'Rembrandt Lighting (Left)',
          'right': 'Rembrandt Lighting (Right)',
          'top': 'Dramatic Top-Down'
      };
      mainLightDesc = `${lighting.main.intensity} intensity ${lighting.main.color} tinted ${directionMap[lighting.main.direction]}. High-CRI commercial lighting.`;
  } else {
      mainLightDesc = `${lighting.main.intensity} intensity softbox strobe from the ${lighting.main.direction}. Evenly diffused for product clarity.`;
  }

  let rimLightDesc = "";
  if (lighting.rim.intensity !== 'none') {
    rimLightDesc = `Add a ${lighting.rim.intensity}, ${lighting.rim.color} rim light/kicker from the ${lighting.rim.direction} to separate subject from background.`;
  }

  const shadowHardness = lighting.main.intensity === 'hard' ? "Contact Hard" : "Diffused Soft";
  
  let shadowInstructions = "";
  let backgroundPrompt = "";

  // ------------------------------------------------------------------
  // CUSTOM BACKGROUND INTELLIGENCE
  // ------------------------------------------------------------------
  if (customBackground) {
      if (customBackground.type === 'color') {
          backgroundPrompt = `
          ENVIRONMENT:
          - Background Color: ${customBackground.value}.
          - Floor: Seamless paper/infinity curve matching the background color exactly.
          - Lighting Interaction: The floor must bounce ${customBackground.value} tinted light onto the bottom of the garment (Global Illumination).
          `;
          shadowInstructions = `Cast a ${shadowHardness} shadow onto the floor color. The shadow must be a multiply blend (darker version of ${customBackground.value}), NOT grey.`;
      } else if (customBackground.type === 'image') {
          backgroundPrompt = `
          ENVIRONMENT:
          - Context: Place the 3D rendered subject into the provided Background Image (Image 2).
          - Integration: Match the camera angle, perspective, and lens distortion of the background image.
          - Lighting Match: Estimate the light source in the background image and match it on the subject.
          `;
          shadowInstructions = `Cast realistic shadows onto the ground plane of the background image. Match the shadow direction and color of existing objects in the scene.`;
      }
  } else {
      // PRESET BACKGROUNDS
      const backgroundInstructions: Record<BackgroundOption, string> = {
        minimal_luxury: `Scene: High-end grey plaster cyclorama wall. Soft, diffused ambient fill.`,
        sunlit_travertine: `Scene: Warm beige stone wall. Dappled sunlight (leaf shadows) projecting onto the background.`,
        urban_concrete: `Scene: Raw industrial concrete wall. Cool, neutral lighting.`,
        moody_editorial: `Scene: Dark charcoal void. High contrast dramatic lighting.`
      };
      backgroundPrompt = `ENVIRONMENT: ${backgroundInstructions[background]}`;
      shadowInstructions = `Cast a ${shadowHardness} drop shadow based on the light direction.`;
  }

  // Fabric Physics (WEIGHT & DENSITY) - REMOVING COLOR BIAS
  const fabricInstructions: Record<FabricType, string> = {
    cotton: "Fabric: Heavyweight Cotton Jersey (300 GSM). Physics: Medium drag. Matte finish. Soft, frequent, rounded folds. Reacts heavily to gravity. High surface detail.",
    fleece: "Fabric: Heavy Cotton French Terry (500 GSM). Physics: High structural stiffness. Resistant to micro-wrinkles. Forms large, tubular, compression-based folds. Soft-body collision. Fuzzy surface texture.",
    // Modified Denim to avoid 'Raw Selvedge' which implies Blue.
    denim: "Fabric: Heavyweight Denim (14oz). Physics: High rigidity. Resists bending. Forms sharp, angular 'honeycomb' creases at joints. Stiff stacking. Visible weave texture.",
    nylon: "Fabric: Ripstop Nylon Shell. Physics: Zero-stretch. Paper-like crumpling behavior. High specular reflection. Crisp, noisy edges on folds. Low friction.",
    leather: "Fabric: Full-grain Leather. Physics: Very high bending stiffness. Heavy weight simulation. Gravity pulls it straight down. Folds are thick and rounded, resembling sculpted clay. Subsurface scattering."
  };

  let selectedMaterialInstruction = fabricInstructions[fabricType];

  if (secondaryFabricType !== 'none' && secondaryFabricType !== fabricType) {
      selectedMaterialInstruction += `\nBlend in texture characteristics of ${secondaryFabricType}.`;
  }

  // Structural Physics (SHAPE & CUT)
  const structuralInstructions: Record<GarmentType, string> = {
      't-shirt': "Structure: Drop-shoulder boxy fit. Gravity pulls fabric vertical from the shoulder line. Slight bunching at the waist.",
      'hoodie': "Structure: Volumetric hood (filled with air). Kangaroo pocket volume. Thick elastic cuffs.",
      'sweatshirt': "Structure: Balloon fit. Tight elastic cuffs create 'blousing' effect on sleeves. Waistband creates a fold-over muffin top effect.",
      'jacket': "Structure: Puffer/Bomber insulation. Simulate internal air pressure. The surface is tensioned outwards. Seams create deep valleys.",
      'pants': "Structure: Wide-leg cut. Fabric cascades from hip to floor. 'Stacking' physics at the ankles where fabric accumulates.",
      'shorts': "Structure: A-frame wide cut. Legs are rigid tubes. Hem creates a distinct shadow line on the leg."
  };

  // Fit Physics (DRAPE)
  const fitInstructions: Record<FitType, string> = {
      'regular': "Fit Physics: Standard drape. Fabric touches body at shoulders, chest, and waist. Moderate folding.",
      'oversized': "Fit Physics: EXCESS FABRIC SIMULATION. Shoulders drop significantly. Deep vertical folds due to extra material. Fabric hangs loose from the body (air gap).",
      'slim': "Fit Physics: HIGH TENSION. Fabric stretches over the form. Horizontal tension lines (whiskering) at stress points. Minimal loose folding."
  };

  // Determine Core Transformation based on ModelMode
  let coreTransformation = "";
  if (modelMode === 'human') {
    coreTransformation = `
      TASK: VIRTUAL PHOTOSHOOT (ON MODEL)
      1. **Analysis**: Look at the input clothing image. Understand the pattern, logo, and cut.
      2. **Generation**: Generate a photorealistic image of a ${modelGender} model wearing this EXACT item.
      3. **Fitting**: The clothing must wrap around the human body realistically. Folds should react to the body underneath.
      4. **Identity**: You must preserve the logo/graphic design from the input image, but warp it to match the fabric folds.
    `;
  } else {
    coreTransformation = `
      TASK: 3D GHOST MANNEQUIN RENDER
      1. **Transformation**: Take the flat input image and INFLATE it into a 3D volumetric object.
      2. **Ghost Effect**: The garment should look like it is being worn by an invisible person. 
         - **Neck**: Show the interior back of the neck label (depth).
         - **Waist/Sleeves**: Show the circular openings with thickness.
      3. **Volume**: Add depth shading. The chest should protrude, the sides should recede. It MUST NOT look flat.
      4. **Texture Mapping**: Warp the texture and graphics from the flat input onto this new 3D form.
    `;
  }

  const prompt = `
    COMMAND: CREATE A 3D PRODUCT RENDER FROM REFERENCE.
    
    INPUT: A 2D reference image of a garment (Input Image 1).
    OUTPUT: A high-fidelity 3D commercial product shot.

    INTELLIGENT EXTRACTION & CLEANUP (CRITICAL STEP):
    - **Background Removal**: The input image may contain a bed, floor, messy room, or hanger. You MUST mathematically separate the garment from this noise.
    - **Reconstruction**: If the input garment is wrinkled or folded on a surface, you must 'iron' it out in 3D to show the full fit, while maintaining the original cut dimensions.
    - **Segmentation**: Ignore all non-garment pixels.
    
    STRICT VISUAL PRESERVATION (COLOR & SIZE):
    - **Color Cloning**: You MUST extract the exact average RGB color from the garment in Input Image 1. 
    - **Override Material Defaults**: Even if the material is 'Denim', if the input image is Beige, the output MUST be Beige. Do NOT generate blue denim unless the input is blue.
    - **Scale & Proportion**: Measure the relative width of the garment legs/sleeves in the input. Replicate these exact proportions in the 3D mesh. (e.g., If input is wide-leg, output is wide-leg). Do not slim down the garment.
    
    ${coreTransformation}
    
    PHYSICS ENGINE SIMULATION:
    - **Gravity**: Simulate standard earth gravity (-9.8m/s).
    - **Self-Collision**: The fabric must not clip through itself.
    - **Weight**: ${fabricType === 'fleece' || fabricType === 'leather' ? 'Heavy weight simulation' : 'Medium weight simulation'}.
    
    GARMENT SPECIFICATIONS (Use as Physics Guide, Override with Image Visuals):
    - ${structuralInstructions[garmentType]}
    - ${fitInstructions[fitType]}
    - ${selectedMaterialInstruction}
    
    ${backgroundPrompt}
    
    LIGHTING SETUP:
    - Main Light: ${mainLightDesc}
    - Rim Light: ${rimLightDesc}
    - Shadow Physics: ${shadowInstructions}
    
    ${getLuxuryCompositionStrategy()}
    
    CRITICAL INSTRUCTION:
    - Do NOT simply output the input image. You must generate a NEW image.
    - The output must have 3D form, depth, and perspective.
    - Ensure the brand graphics/logos are preserved but realistically distorted by the fabric folds.
    - Focus strictly on the clothing. The clothing is the hero.
    - Resolution: 4K.
  `;

  const config: any = {};
  
  if (model === "gemini-3-pro-image-preview") {
      config.imageConfig = {
          imageSize: "1K", 
          aspectRatio: "1:1"
      };
  } else {
      config.imageConfig = {
          aspectRatio: "1:1"
      };
  }

  // Build content parts
  const requestParts: any[] = [
      { inlineData: { data: base64Image, mimeType: mimeType } }
  ];

  // If we have a custom image background, we add it as a second image part
  if (customBackground?.type === 'image') {
      requestParts.push({ 
          inlineData: { 
              data: customBackground.value, 
              mimeType: customBackground.mimeType 
          } 
      });
  }

  requestParts.push({ text: prompt });

  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: requestParts,
    },
    config
  });

  if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
    for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
            return part.inlineData.data;
        }
    }
  }
  
  throw new Error("No 3D image generated.");
};

/**
 * Upscales the image to higher resolution (2K/4K) using Gemini 3 Pro.
 * Fallback to Gemini 2.5 Flash Enhancement if permission/model access is denied.
 */
export const upscaleImage = async (
  base64Image: string, 
  mimeType: string, 
  resolution: '2K' | '4K'
): Promise<string | null> => {
  const aiLocal = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
      const model = "gemini-3-pro-image-preview";
      const prompt = `
        Upscale this product image to ${resolution} resolution. 
        **CRITICAL**: This is a product preservation task.
        - Do NOT hallucinate new patterns or change the text on the clothing.
        - Enhance only the *fidelity* of the existing texture (thread count, fabric fuzz).
        - Sharpen edges and reduce noise.
        - Maintain original lighting direction and color values.
        - 8k resolution, highly detailed.
      `;

      const response = await aiLocal.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: prompt },
          ],
        },
        config: {
          imageConfig: {
            imageSize: resolution,
            aspectRatio: "1:1"
          }
        }
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return part.inlineData.data;
        }
      }
  } catch (error) {
      console.warn("Gemini 3 Pro Upscale failed. Falling back to 2.5 Flash.", error);
  }

  try {
      console.log("Using fallback model for Upscale: gemini-2.5-flash-image");
      const model = "gemini-2.5-flash-image";
      const prompt = `
        Enhance and refine this image. Increase sharpness, improve lighting, and clean up details.
        Output a high-quality, professional product photo. 8k resolution.
        Do not alter the design or logos.
      `;

      const response = await aiLocal.models.generateContent({
        model,
        contents: {
          parts: [
            { inlineData: { data: base64Image, mimeType: mimeType } },
            { text: prompt },
          ],
        },
      });

      if (response.candidates?.[0]?.content?.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) return part.inlineData.data;
        }
      }
      
      throw new Error("Upscale failed even with fallback model.");

  } catch (error) {
      throw error;
  }
};

/**
 * Generates a virtual try-on image using the free model exclusively.
 * Model: gemini-2.5-flash-image
 */
export const generateVirtualTryOn = async (
  garmentBase64: string,
  modelBase64: string,
  mimeType: string
): Promise<string | null> => {
  const aiLocal = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-2.5-flash-image";
  
  const prompt = `
    Perform a virtual try-on task.
    
    INPUTS:
    - Image 1: A garment/clothing item (Source).
    - Image 2: A model/person (Target).
    
    TASK:
    Generate a new photorealistic image of the person from Image 2 wearing the garment from Image 1.
    
    EXTRACTION & PHYSICS RULES:
    1. **Isolation**: Extract the garment from Image 1 perfectly. Ignore the hanger, floor, or background.
    2. **Fitting**: Warp the garment to match the body shape and pose of the model in Image 2.
    3. **Physics**: Ensure gravity pulls the fabric correctly. Add folds where the body bends (elbows, waist).
    4. **Lighting**: Match the lighting from Image 2 onto the new garment.
    
    REQUIREMENTS:
    - Preserve the person's identity and original background from Image 2.
    - High quality, 8k resolution.
  `;

  try {
    const response = await aiLocal.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { data: garmentBase64, mimeType: mimeType } },
          { inlineData: { data: modelBase64, mimeType: mimeType } },
          { text: prompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4" 
        }
      }
    });

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) return part.inlineData.data;
      }
    }
    
    throw new Error("No image generated.");
  } catch (error: any) {
    console.error("Virtual Try-On Error:", error);
    throw new Error(error.message || "Failed to generate try-on image.");
  }
};
