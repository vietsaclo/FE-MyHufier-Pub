const https = require('https');
const express = require('express');
const app = express();
const fs = require("fs");
const path = require('path');
const PORT = 1128;
const indexPath = path.resolve(__dirname, '..', 'build', 'index.html');
const axios = require('axios');

const options = {
  key: fs.readFileSync('./ssls/myhufier_key.key'),
  cert: fs.readFileSync('./ssls/myhufier_crt.crt')
};

// CONST CONFIG
const domain = 'https://myhufier.com/api';
const routePost = '/post/';
const routerImage = '/files/image/';
const prefix_check = '/post/'

const httpsServer = https.createServer(options, app);
httpsServer.listen(PORT, '0.0.0.0', () => {
  console.log("Server listening on port: " + PORT + ` | https://localhost:${PORT}`);
});

// static resources should just be served as they are
app.use(express.static(
  path.resolve(__dirname, '..', 'build'),
  { maxAge: '30d' },
));

// here we serve the index.html page
app.get('/*', (req, res, _next) => {
  fs.readFile(indexPath, 'utf8', async (err, htmlData) => {
    if (err) {
      console.error('Error during file reading', err);
      return res.status(404).end();
    }

    const pathname = req.url;
    if (!pathname) return res.send(htmlData);
    const pathCheck = pathname.substring(0, prefix_check.length);
    if (pathCheck !== prefix_check) return res.send(htmlData);
    const idPost = pathname.substring(pathname.lastIndexOf('.') + 1, pathname.length);

    let data = await axios.get(domain + routePost + idPost);
    data = data.data;
    if (!data || !data.success) return res.send(htmlData);
    const post = data.result;
    const newImage = domain + routerImage + post.imageBanner;
    // inject meta tags
    htmlData = htmlData.replace(
      "<title>MY-HUFIER | Cộng đồng người học tại HUFI</title>",
      `<title>${post.title}</title>`
    )
      .replace(`content="https://myhufier.com/"`, `content=${domain.substring(0, domain.indexOf('/api'))}${routePost}${post.slug}.${post.id}`)
      .replace(`content="https://myhufier.com/"`, `content=${domain.substring(0, domain.indexOf('/api'))}${routePost}${post.slug}.${post.id}`)
      .replace('MY-HUFIER | Cộng đồng người học tại HUFI', post.title)
      .replace('MY-HUFIER | Cộng đồng người học tại HUFI', post.title)
      .replace('Nơi bạn tìm thấy những tài liệu học tập hay, bạn muốn thi thử trước khi thi thiệt ?. Hãy vào đây. À đừng quyên chia sẽ những tài liệu hay của bạn cho những bạn khác nữa nhé.^^', post.description)
      .replace('Nơi bạn tìm thấy những tài liệu học tập hay, bạn muốn thi thử trước khi thi thiệt ?. Hãy vào đây. À đừng quyên chia sẽ những tài liệu hay của bạn cho những bạn khác nữa nhé.^^', post.description)
      .replace('Nơi bạn tìm thấy những tài liệu học tập hay, bạn muốn thi thử trước khi thi thiệt ?. Hãy vào đây. À đừng quyên chia sẽ những tài liệu hay của bạn cho những bạn khác nữa nhé.^^', post.description)
      .replace('https://myhufier.com/api/files/image/banner-default.jpeg', newImage)
      .replace('https://myhufier.com/api/files/image/banner-default.jpeg', newImage)
    return res.send(htmlData);
  });
});