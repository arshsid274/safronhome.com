import http from 'http';
import { stat, readFile } from 'fs/promises';
import { extname, join, normalize } from 'path';
const ROOT = process.cwd();
const PORT = 8000;
const TYPES={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.avif':'image/avif','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.gif':'image/gif','.woff':'font/woff','.woff2':'font/woff2','.ttf':'font/ttf','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.mp4':'video/mp4'};
async function tryFiles(p){
  for(const c of [p, p+'.html', join(p,'index.html')]){
    try{ const s=await stat(c); if(s.isFile()) return c; }catch{}
  }
  return null;
}
http.createServer(async (req,res)=>{
  let url=decodeURIComponent(req.url.split('?')[0]);
  let fp=normalize(join(ROOT,url));
  if(!fp.startsWith(ROOT)){res.writeHead(403);return res.end('forbidden');}
  let found=await tryFiles(fp);
  if(!found && url==='/') found=join(ROOT,'index.html');
  if(!found){res.writeHead(404,{'content-type':'text/html'});return res.end('<h1>404</h1>'+url);}
  const body=await readFile(found);
  res.writeHead(200,{'content-type':TYPES[extname(found)]||'application/octet-stream','cache-control':'no-cache'});
  res.end(body);
}).listen(PORT,'127.0.0.1',()=>console.log('Serving '+ROOT+' at http://127.0.0.1:'+PORT));
