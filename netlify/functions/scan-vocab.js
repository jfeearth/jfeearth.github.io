// Diese Funktion wird von Netlify ausgeführt, nicht im Browser des Nutzers.
exports.handler = async function(event, context) {
  // Nur POST-Anfragen erlauben
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Die Bilddaten aus der Anfrage des Nutzers auslesen
    const { mimeType, data: base64Data } = JSON.parse(event.body);
    
    // Deinen API-Schlüssel sicher aus den Netlify-Umgebungsvariablen holen
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error("API-Schlüssel ist nicht konfiguriert.");
    }

    const fetch = (await import('node-fetch')).default;
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${API_KEY}`;
    
    const prompt = `Analysiere das Bild einer Vokabelliste. Extrahiere alle Wort-Übersetzungs-Paare. Gib das Ergebnis als valides JSON-Array zurück. Jedes Objekt im Array soll die Schlüssel "word" und "translation" haben. Beispiel-Format: [{"word": "house", "translation": "Haus"}] Ignoriere alles andere. Wenn keine Vokabeln gefunden werden, gib ein leeres Array zurück.`;

    const payload = {
      contents: [{
        parts: [
          { text: prompt },
          { inline_data: { mime_type: mimeType, data: base64Data } }
        ]
      }]
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Fehler von der Gemini API:", errorBody);
      return { statusCode: 500, body: `Fehler von der Gemini API: ${errorBody}` };
    }
    
    const result = await response.json();
    const text = result.candidates[0].content.parts[0].text;
    const cleanedText = text.trim().replace(/```json/g, "").replace(/```/g, "").trim();
    const vocabs = JSON.parse(cleanedText);

    // Das Ergebnis an die Webseite zurücksenden
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vocabs })
    };

  } catch (error) {
    console.error("Fehler in der Netlify Function:", error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};