import { getUserKey, getUsername } from "$lib/data_functions/get_functions";
import { uploadFile } from "@junobuild/core-peer";
import fs from 'fs';
import path from "path";
/**
 * @param {string} type
 * @param {string} title
 * @param {string} description
 * @param {string} image
 * @param {string} type
 * @param {string} url
 */
export async function metadataTagsCreator(title, description, image, type, url){

    
    type = type.length==0?"website":type;
    let user = await getUsername(await getUserKey());
    return  `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="description" content="${description}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:image" content="${image}" />
      <meta property="og:type" content="${type}" />
      <meta property="og:url" content="${url}" />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content="${title}" />
      <meta name="twitter:description" content="${description}" />
      <meta name="twitter:image" content="${image}" />
      <meta name="twitter:creator" content="${user}" />
      <title>${title}</title>
      <meta name="author" content="${user}" />
    </head>
    <body>
      <noscript>Please enable JavaScript to view the full content.</noscript>
  
      <div id="app"></div> 
  
     
      <script>
        // This JavaScript will load the full Svelte app for users
        window.onload = function() {
          // Load the full Svelte app dynamically
          if (!window.navigator.userAgent.includes("bot") && !window.navigator.userAgent.includes("crawler")) {
        const currentUrl = window.location.href;
        if (!currentUrl.endsWith('/')) {
          window.location.href = currentUrl + '/'; // Redirect to URL with trailing slash
        }
      }
        }
      </script>
    </body>
    </html>`;
};

/**
 * @param {string} collection
 * @param {string} id
 * @param {BlobPart} compiledHTML
 */
export async function uploadHTMLToDatabase(compiledHTML,collection, id){
  try{
    const blob = new Blob([compiledHTML], { type: "text/html" });
    const file = new File([blob], id + ".html", {
        type: "text/html",
        lastModified: new Date().getTime(),
    });
  
    console.log("The size is", file.size);
    // Step 4: Upload the file to Juno's storage
    const result = await uploadFile({
        data: file,
        collection: collection,
    });
  
    // Display the uploaded file's URL
    return result.downloadUrl;
  }
  catch(e){
    throw new Error("Something went wrong when uploading html static file...")
  }
}

/**
 * @param {number} amount
 * @param {string} title
 * @param {string} user
 * @param {string} id
 * @returns {Promise<File>} A PNG image with the amount and title.
 */
export async function createPledgeImage(amount, title, user, id) {
  // Create an off-screen canvas
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;

  // Get canvas context
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Something went wrong when creating the image!");
  }

  // Set gradient background (using primary and secondary colors)
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#ff6000'); // Primary color (orange)
  gradient.addColorStop(1, 'rgb(255, 60, 0)'); // Secondary color
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw Amount (left side, large and bold)
  ctx.font = 'bold 150pt Barlow';
  ctx.fillStyle = 'white'; // White text for visibility
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`$${amount}`, 80, canvas.height / 2); // Keep this large and centered vertically

  // Draw "New Pledge!" next to the amount
  ctx.font = 'bold 40pt Barlow';
  ctx.fillStyle = '#FFE6C7'; // Fifth color (white-orange)
  ctx.textAlign = 'left';
  ctx.fillText('New Pledge!', 400, canvas.height / 2 - 40); // Positioned to the right of amount, aligned slightly higher

  // Draw User and Title (small text, below "New Pledge!" next to the amount)
  ctx.font = '30pt Barlow';
  ctx.fillStyle = '#EEEEEE'; // Fourth color (white-v2)
  ctx.textAlign = 'left';
  
  // Wrap text for the user and title if it overflows
  const userTitleText = `${user} has pledged to ${title}`;
  const maxLineWidth = canvas.width - 400; // Max width for the text

  // Ensure the text is positioned under "New Pledge!"
  wrapText(ctx, userTitleText, 400, canvas.height / 2 + 40, maxLineWidth, 40);

  // Convert canvas to Blob
  return new Promise((resolve) => {
    const logo = new Image();
    logo.src = '/assets/logo-13.png';
    
    logo.onload = () => {
      // Draw the logo on the bottom-right
      const logoWidth = 200;  // Set logo width (adjust size as needed)
      const logoHeight = 200; // Set logo height (adjust size as needed)
      ctx.drawImage(logo, canvas.width - logoWidth - 20, canvas.height - logoHeight - 20, logoWidth, logoHeight);
      
      // Convert canvas to Blob after logo is drawn
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error("Something went wrong when creating the image!");
        }
        const file = new File([blob], id + '.png', {
          type: 'image/png',
          lastModified: Date.now(),
        });
        resolve(file); // Return the file
      }, 'image/png');
    };
  });
}

/**
 * Function to wrap text within a certain width on the canvas
 * @param {CanvasRenderingContext2D} ctx
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} maxWidth
 * @param {number} lineHeight
 */
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + ' ';
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}



/**
 * @param {any} collection
 * @param {File} image
 */
export async function uploadImageToDatabase(collection,image){
  try{
    
  
    console.log("The image is", image.size);
    // Step 4: Upload the file to Juno's storage
    const result = await uploadFile({
        data: image,
        collection: collection,
    });
    return result.downloadUrl;
  }
  catch(e){
    throw new Error("Something went wrong when uploading image  ...")
  }
}

/**
 * @param {number} amount
 * @param {string} title
 * @param {string} user
 * @param {string} id
 * @param {string} description
 */
export async function createPledgeMetatags(amount, title, user, id, description){
  let imageURL =await uploadImageToDatabase("pledges-images", await createPledgeImage(amount, title, user, id));
  let htmlPledge = metadataTagsCreator(title,description,imageURL,"website","https://solutio.one/pledges/"+id);
  return htmlPledge;
}

/**
 * @param {string} title
 * @param {string} image
 * @param {string} id
 * @param {string} description
 * @param {string} elementType
 */
export async function createAndUploadHTMLStaticFile( title, id, description, image, elementType){
  const defaultImage = 'https://solutio.one/solutio-images/logo-01.png'; 
  image = image || defaultImage;
  let html = await metadataTagsCreator(title,description,image,"website","https://solutio.one/"+elementType+"/"+id);
  let URL = await uploadHTMLToDatabase(html,elementType,id);
};


/**
 * Update the sitemap.xml file when a new topic is created.
 * @param {string} id - The ID of the new topic
 */
export async function updateSiteMapxml(id) {
  const sitemapUrl = 'https://solutio.one/solutio-files/sitemap.xml'; // Assuming it's hosted
  const response = await fetch(sitemapUrl);
  let sitemap = await response.text();
  console.log("Sitemap: ",sitemap)
  // If the sitemap doesn't exist, start a new one
  if (!sitemap) {
    sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
<url>
  <loc>https://solutio.one</loc>
  <lastmod>2024-09-18T19:39:50+00:00</lastmod>
  <priority>1</priority>
</url>
  <url>
    <loc>https://solutio.one/createtopic</loc>
    <lastmod>2024-09-18T19:39:50+00:00</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://solutio.one/feed</loc>
    <lastmod>2024-09-18T19:39:50+00:00</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://solutio.one/myideas</loc>
    <lastmod>2024-09-18T19:39:50+00:00</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>`;
  }

  // Create the new topic URL
  const newTopicUrl = `
  <url>
    <loc>https://solutio.one/topic/${id}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>0.8</priority>
  </url>`;

  // Insert the new topic URL before the closing </urlset> tag
  const insertIndex = sitemap.indexOf('</urlset>');
  const updatedSitemap = [
    sitemap.slice(0, insertIndex),
    newTopicUrl,
    sitemap.slice(insertIndex),
  ].join('');
  console.log("Updated Sitemap: ",updatedSitemap)
  // Convert updated sitemap to a Blob (or File)
  const sitemapBlob = new Blob([updatedSitemap], { type: 'text/xml' });

  // Create a File from Blob to upload (optional)
  const sitemapFile = new File([sitemapBlob], 'sitemap.xml', { type: 'text/xml' });
  let url = await uploadFileToDatabase(sitemapFile,"solutio-files");
  console.log("URL: ",url)
  return (url)
}



/**
 * @param {string} collection
 * @param {File} file
 */
export async function uploadFileToDatabase(file,collection){
  try{
    
    console.log("The size is", file.size);
    // Step 4: Upload the file to Juno's storage
    const result = await uploadFile({
        data: file,
        collection: collection,
    });
  
    // Display the uploaded file's URL
    return result.downloadUrl;
  }
  catch(e){
    throw new Error("Something went wrong when uploading file...")
  }
}