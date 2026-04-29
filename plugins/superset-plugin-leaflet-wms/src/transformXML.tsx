
/**
 * Formatiert eine XML-Antwort von WMS GetFeatureInfo in ansprechendes HTML
 */
export const formatFeatureInfoResponse = (responseText: string, layerName: string): string => {
    // Überprüfen, ob die Antwort leer oder ungültig ist
    if (!responseText || responseText.trim() === '' || responseText.includes('LayerNotDefined') || responseText.includes('WMS server error') ||
        (responseText.includes('<msGMLOutput') && responseText.split('<').length < 10)) {
        return '';
    }

    try {
        // XML parsen
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseText, 'text/xml');
        
        // Finde den msGMLOutput-Node
        const msGMLOutput = xmlDoc.getElementsByTagName('msGMLOutput')[0];
        if (!msGMLOutput) {
            return responseText; // Falls kein msGMLOutput, original zurückgeben
        }
        
        // Layer finden (erstes Element im msGMLOutput)
        let layerElement = null;
        let layerTitle = layerName;
        
        // Alle direkten Kindelemente von msGMLOutput durchlaufen
        for (let i = 0; i < msGMLOutput.childNodes.length; i++) {
            const node = msGMLOutput.childNodes[i];
            if (node.nodeType === 1) { // Element-Node
                layerElement = node;
                break;
            }
        }
        
        if (!layerElement) {
            return `
                <div class="feature-info-empty">
                    <h3>Keine Layer-Informationen</h3>
                    <p>Die Antwort enthält keine Layer-Daten.</p>
                </div>
            `;
        }
        
        // Layernamen extrahieren
        const nameElements = layerElement.getElementsByTagName('gml:name');
        if (nameElements && nameElements.length > 0) {
            layerTitle = nameElements[0].textContent || layerTitle;
        }
        
        // Feature-Element finden (enthält die eigentlichen Attribute)
        let featureElement = null;
        
        // Alle Kindelemente durchlaufen, um das Feature-Element zu finden
        for (let i = 0; i < layerElement.childNodes.length; i++) {
            const node = layerElement.childNodes[i];
            if (node.nodeType === 1 && node.nodeName.includes('feature')) {
                featureElement = node;
                break;
            }
        }
        
        if (!featureElement) {
            return `
                <div class="feature-info-empty">
                    <h3>Keine Feature-Informationen</h3>
                    <p>Die Antwort enthält keine Feature-Daten.</p>
                </div>
            `;
        }
        
        // Attribute extrahieren
        const attributes: Record<string, string> = {};
        const excludedTags = ['gml:boundedBy', 'gml:Box', 'gml:coordinates'];
        
        for (let i = 0; i < featureElement.childNodes.length; i++) {
            const node = featureElement.childNodes[i];
            if (node.nodeType === 1) { // Element-Node
                const tagName = node.nodeName;
                
                // Bestimmte Tags überspringen
                if (excludedTags.includes(tagName)) continue;
                
                attributes[tagName] = node.textContent || '';
            }
        }
        
        // Spezielle Attribute für die strukturierte Anzeige
        const name = attributes['name'] || '';
        const art = attributes['art'] || '';
        let adresse = attributes['adresse'] || '';
        
        // Adresse zusammensetzen, falls nicht direkt vorhanden
        if (!adresse && attributes['strasse']) {
            adresse = attributes['strasse'];
            if (attributes['hnr']) {
                adresse += ' ' + attributes['hnr'];
                if (attributes['hnrz'] && attributes['hnrz'].trim() !== '') {
                    adresse += ' ' + attributes['hnrz'];
                }
            }
            if (attributes['plz'] && attributes['ort']) {
                adresse += '<br>' + attributes['plz'] + ' ' + attributes['ort'];
            }
        }
        
        // Link verarbeiten
        let linkHtml = '';
        if (attributes['link_html'] && attributes['link_html'].trim() !== '') {
            linkHtml = attributes['link_html'];
        } else if (attributes['link'] && attributes['link'].trim() !== '') {
            const link = attributes['link'].startsWith('http') 
                ? attributes['link'] 
                : 'https://' + attributes['link'];
            linkHtml = `<a href="${link}" target="_blank">${attributes['link']}</a> (neue Seite)`;
        }
        
        // Attribute filtern, die bereits in der strukturierten Anzeige verwendet werden
        const displayedAttributes = ['name', 'art', 'strasse', 'hnr', 'hnrz', 'plz', 'ort', 'adresse', 'link', 'link_html', 'id'];
        const detailAttributes: Record<string, string> = {};
        
        for (const [key, value] of Object.entries(attributes)) {
            if (!displayedAttributes.includes(key) && value.trim() !== '') {
                detailAttributes[key] = value;
            }
        }
        
        // HTML-Struktur erstellen
        let html = `
            <style>
                .feature-info-container {
                    font-family: Arial, sans-serif;
                    max-width: 500px;
                    padding: 15px;
                    background-color: #fff;
                    border-radius: 5px;
                }
                .feature-info-header {
                    margin-top: 0;
                    color: #2c3e50;
                    font-size: 16px;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 8px;
                }
                .feature-info-title {
                    margin: 12px 0 5px 0;
                    color: #3498db;
                    font-size: 18px;
                    font-weight: bold;
                }
                .feature-info-type {
                    color: #7f8c8d;
                    font-style: italic;
                    margin: 5px 0;
                }
                .feature-info-address {
                    margin: 10px 0;
                    font-weight: 500;
                }
                .feature-info-link {
                    margin: 10px 0;
                }
                .feature-info-link a {
                    color: #2980b9;
                    text-decoration: none;
                }
                .feature-info-link a:hover {
                    text-decoration: underline;
                }
                .feature-info-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 15px;
                }
                .feature-info-table td {
                    padding: 8px;
                    border-bottom: 1px solid #eee;
                }
                .feature-info-table tr:last-child td {
                    border-bottom: none;
                }
                .feature-info-label {
                    font-weight: bold;
                    color: #555;
                }
                .feature-info-empty {
                    padding: 20px;
                    text-align: center;
                    color: #7f8c8d;
                    background-color: #f8f9fa;
                    border-radius: 5px;
                }
            </style>
            
            <div class="feature-info-container">
                <h3 class="feature-info-header">${layerTitle}</h3>
        `;
        
        if (name) {
            html += `<div class="feature-info-title">${name}</div>`;
        }
        
        if (art) {
            html += `<div class="feature-info-type">${art}</div>`;
        }
        
        if (adresse) {
            html += `<div class="feature-info-address">${adresse}</div>`;
        }
        
        if (linkHtml) {
            html += `<div class="feature-info-link">${linkHtml}</div>`;
        }
        
        // Zusätzliche Attribute anzeigen
        if (Object.keys(detailAttributes).length > 0) {
            html += `
                <table class="feature-info-table">
                    <tbody>
            `;
            
            for (const [key, value] of Object.entries(detailAttributes)) {
                // Schlüssel formatieren: Camel/Snake Case in lesbaren Text umwandeln
                const formattedKey = key
                    .replace(/([A-Z])/g, ' $1') // Leerzeichen vor Großbuchstaben
                    .replace(/_/g, ' ')         // Unterstriche durch Leerzeichen ersetzen
                    .replace(/^./, str => str.toUpperCase()) // Ersten Buchstaben groß
                    .trim();
                
                html += `
                    <tr>
                        <td class="feature-info-label">${formattedKey}</td>
                        <td>${value}</td>
                    </tr>
                `;
            }
            
            html += `
                    </tbody>
                </table>
            `;
        }
        
        html += `</div>`;
        
        return html;
    } catch (error) {
        console.error('Fehler beim Parsen der XML-Antwort:', error);
        
        // Fehlerfall: Original-Antwort mit Styling zurückgeben
        return `
            <div style="font-family: Arial, sans-serif; padding: 15px; background-color: #f8d7da; border-radius: 5px; color: #721c24;">
                <h3 style="margin-top: 0;">Fehler beim Verarbeiten der Daten</h3>
                <p>Die Antwort konnte nicht korrekt formatiert werden.</p>
                <details>
                    <summary>XML-Antwort anzeigen</summary>
                    <pre style="background-color: #f8f9fa; padding: 10px; overflow: auto; max-height: 200px; font-size: 12px;">${responseText.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                </details>
            </div>
        `;
    }
};