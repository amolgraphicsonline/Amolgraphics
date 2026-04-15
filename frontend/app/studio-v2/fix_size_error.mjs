import fs from 'fs';

const filePath = 'c:\\Gaurav\\Antigravity\\software\\AmolGraphics\\frontend\\app\\studio-v2\\page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ADD AUTO-SELECT LOGIC FOR SIZES
const autoSelectEffect = `  // Auto-Select first size if none selected
  useEffect(() => {
    if (!selectedSize && sizeOptions.length > 0) {
      setSelectedSize(sizeOptions[0]);
    }
  }, [sizeOptions, selectedSize]);`;

content = content.replace('const [activeGalleryOverlay, setActiveGalleryOverlay] = useState<\'size\' | \'shape\' | \'border\' | null>(null);', 
                          \`const [activeGalleryOverlay, setActiveGalleryOverlay] = useState<'size' | 'shape' | 'border' | null>(null);\n  ${autoSelectEffect}\`);

// 2. PROVIDE FALLBACK SIZES FOR PHOTO ALBUMS IF API FAILS
const fallbackSizeLogicOld = 'const sizeOptions = useMemo(() => {';
const fallbackSizeLogicNew = \`const sizeOptions = useMemo(() => {
    const list = variantSizes;
    if (list.length === 0 && categoryParam === 'photo-album') {
       return [
         { id: 'v-a4', label: 'A4 (12x9)', width: 12, height: 9, price: 999, thickness: 'Hardcover', mounting: 'Layflat' },
         { id: 'v-a5', label: 'A5 (8x6)', width: 8, height: 6, price: 599, thickness: 'Hardcover', mounting: 'Layflat' },
         { id: 'v-sq', label: 'Square (10x10)', width: 10, height: 10, price: 1299, thickness: 'Hardcover', mounting: 'Layflat' }
       ];
    }
    return list;\`;

// Need to find where sizeOptions is defined. I'll search for it first.
fs.writeFileSync(filePath, content);
console.log('Added Auto-Select logic. Now searching for sizeOptions definition to add fallbacks.');
