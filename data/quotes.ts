
import { DailyQuote } from '../types';
import { RAW_QUOTES_DATA } from './rawQuotes';

const parseQuotes = (data: string): DailyQuote[] => {
  const quotes: DailyQuote[] = [];
  // Split by newlines to process line by line
  const lines = data.split('\n');
  
  let currentDateKey = '';
  let currentBuffer: string[] = [];

  // Match months in Hindi including alternate spellings
  const months = [
      "जनवरी", "फ़रवरी", "फरवरी", "मार्च", "अप्रैल", "मई", "जून", 
      "जुलाई", "अगस्त", "सितंबर", "सितम्बर", "अक्टूबर", "नवंबर", "नवम्बर", "दिसंबर", "दिसम्बर"
  ];
  
  // RegEx to identify a date line (e.g., "1 जनवरी" or "25 दिसंबर")
  const dateRegex = new RegExp(`^\\d{1,2}\\s+(${months.join('|')})`, 'i');

  const saveQuote = () => {
    if (currentDateKey && currentBuffer.length > 0) {
        // Filter out empty lines
        const contentLines = currentBuffer.map(l => l.trim()).filter(l => l);
        
        if (contentLines.length > 0) {
            let source = '';
            let textLines = [];
            
            // Heuristic: Check if the last line looks like a source citation
            // (Starts with '-', contains 'महाराज', 'स्रोत', or is enclosed in brackets/parens)
            const lastLine = contentLines[contentLines.length - 1];
            
            // Check for specific markers or length relative to typical source lines
            const isSourceLike = 
                lastLine.includes("महाराज") || 
                lastLine.startsWith("-") || 
                lastLine.includes("स्रोत") ||
                lastLine.includes("महोत्सव") ||
                lastLine.includes("भागवत कथा");

            if (isSourceLike && contentLines.length > 1) {
                source = lastLine;
                textLines = contentLines.slice(0, contentLines.length - 1);
            } else {
                textLines = contentLines;
            }

            quotes.push({
                dateKey: currentDateKey.trim(),
                text: textLines.join('\n\n'), // Preserve paragraph breaks
                source: source
            });
        }
    }
  };

  for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      if (dateRegex.test(trimmed)) {
          // Found a new date header, save the previous one
          saveQuote();
          
          // Start tracking new quote
          currentDateKey = trimmed;
          currentBuffer = [];
      } else {
          // Accumulate lines for the current quote
          currentBuffer.push(trimmed);
      }
  }
  
  // Save the final quote after loop ends
  saveQuote();

  return quotes;
};

// Export the parsed data
export const QUOTES_DATA: DailyQuote[] = parseQuotes(RAW_QUOTES_DATA);
