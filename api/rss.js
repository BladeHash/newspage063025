// Vercel serverless function to proxy RSS feeds for mobile compatibility
export default async function handler(req, res) {
    // Enable CORS for all origins
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    
    const { url } = req.query;
    
    if (!url) {
        res.status(400).json({ error: 'URL parameter required' });
        return;
    }
    
    try {
        console.log('Fetching RSS:', url);
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'application/rss+xml, application/xml, text/xml, */*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache'
            },
            timeout: 10000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const xmlText = await response.text();
        
        if (!xmlText || xmlText.length < 100) {
            throw new Error('Invalid or empty RSS response');
        }
        
        console.log(`✅ RSS fetched successfully: ${xmlText.length} characters`);
        
        // Return XML with proper headers
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.status(200).send(xmlText);
        
    } catch (error) {
        console.error('RSS fetch error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch RSS feed',
            details: error.message 
        });
    }
}