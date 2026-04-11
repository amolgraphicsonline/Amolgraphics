const fs = require('fs');
const path = 'c:/Gaurav/Antigravity/software/AmolGraphics/frontend/app/acrylic-photo/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Looking for the problematic transition from </div> to onClick
const target = `                    </div>
                     onClick={handleSubmitOrder}`;

const replacement = `                    </div>

                    <button
                     onClick={handleSubmitOrder}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(path, content);
    console.log("Fixed button tag");
} else {
    console.log("Target not found exactly. Checking alternatives.");
    // Try simple regex
    const regex = /<\/div>\s+onClick=\{handleSubmitOrder\}/;
    if (regex.test(content)) {
        content = content.replace(regex, `</div>\n\n                   <button\n                     onClick={handleSubmitOrder}`);
        fs.writeFileSync(path, content);
        console.log("Fixed button tag with regex");
    } else {
        console.log("Regex also failed to match");
    }
}
