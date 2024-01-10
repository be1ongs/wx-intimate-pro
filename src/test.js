const pdfjsLib = require('pdf-lib'); // 引入 pdfjs-dist 库
const fs = require('fs');
const { PDFDocumentFactory, PDFDocumentWriter } = require('pdfjs-2'); // 引入 pdfjs-2 库
const { createCanvas } = require('canvas'); // 引入 canvas 库，用于在 Node.js 环境中创建画布

// 输出图片的路径
const outputImagePath = 'E:\\tuzhi\\';

async function renderPdfToImages() {


    const pdfBytes = new Uint8Array(fs.readFileSync('E:\\tuzhipdf\\001.pdf')); // 读取 PDF 文件的字节数据

    const pdfDoc = await PDFDocumentFactory(pdfBytes, {});
    for (let i = 0; i < pdfDoc.numPages; i++) {
        const page = pdfDoc.getPage(i);
        const scale = 1.5;
        const viewport = page.getViewport({ scale });

        const canvas = createCanvas(viewport.width, viewport.height); // 创建画布
        const context = canvas.getContext('2d');
        const renderContext = {
            canvasContext: context,
            viewport,
        };

        await page.render(renderContext);
        const buffer = canvas.toBuffer('image/png');
        const filePath = `${outputImagePath}page_${i + 1}.png`;
        fs.writeFileSync(filePath, buffer);
        console.log(`Page ${i + 1} is saved as ${filePath}`);
    }
}

renderPdfToImages();
