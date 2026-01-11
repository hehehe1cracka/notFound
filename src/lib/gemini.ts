import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyBfNf50QScgjuvrLM62uJA-bNIKG2W2kBI";
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export async function generateCaption(role: string, imageUrl?: string) {
    if (!genAI) {
        return "Building the future, one update at a time. #Momentum";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-latest" });
        const prompt = `Generate a short, punchy, and inspiring startup update caption for a ${role}. 
    Focus on "proof of work" and "building in public". 
    Include 1-2 relevant hashtags. Keep it under 150 characters.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Progress update: Staying focused on the mission. 🚀 #BuildingInPublic";
    }
}

export async function suggestStartupStrategy(startupName: string, description: string) {
    if (!genAI) {
        return "Focus on shipping small updates frequently to maintain momentum.";
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `As an elite startup mentor, provide 3 actionable, high-momentum tips for a startup called "${startupName}". 
    Description: "${description}". 
    Focus on authenticity and transparency. Keep it concise.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text().trim();
    } catch (error) {
        console.error("Gemini Error:", error);
        return "1. Ship small updates daily. 2. Share visual proof. 3. Engage with your community.";
    }
}
