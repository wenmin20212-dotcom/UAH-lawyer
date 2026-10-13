const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const argument=name=>{const i=process.argv.indexOf(name);return i<0?null:process.argv[i+1];};
const manifest=JSON.parse(fs.readFileSync(path.join(root,'demold.json'),'utf8'));
const output=path.join(root,'build/payload');
function hash(file){return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');}
function checkedTree(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){const file=path.join(directory,item.name);if(fs.lstatSync(file).isSymbolicLink())throw Error('Runtime links are not accepted');if(item.isDirectory())checkedTree(file);}}
(async()=>{
 let base=argument('--base');
 if(!base){
  const reference=JSON.parse(fs.readFileSync(path.join(root,'runtime-reference.json'),'utf8'));
  if(!reference.url||!reference.sha256)throw Error('Supply --base <clean runtime directory> for the initial release build');
  const zip=path.join(root,'build/runtime-base.zip');fs.mkdirSync(path.dirname(zip),{recursive:true});
  const response=await fetch(reference.url);if(!response.ok)throw Error('Runtime download failed: '+response.status);
  fs.writeFileSync(zip,Buffer.from(await response.arrayBuffer()));if(hash(zip)!==reference.sha256)throw Error('Runtime ZIP SHA256 mismatch');
  const extracted=path.join(root,'build/runtime-base');if(fs.existsSync(extracted))throw Error('Runtime extraction directory exists; use a new checkout or --base');
  execFileSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File',path.join(root,'tools/extract-runtime.ps1'),'-ArchivePath',zip,'-DestinationPath',extracted],{windowsHide:true});
  const folders=fs.readdirSync(extracted).filter(name=>fs.statSync(path.join(extracted,name)).isDirectory());
  base=fs.existsSync(path.join(extracted,'app'))?extracted:folders.length===1?path.join(extracted,folders[0]):null;
 }
 if(!base)throw Error('Could not locate the binary runtime');base=path.resolve(base);
 for(const file of ['app/BOSS-win32-x64/BOSS.exe','app/BOSS-win32-x64/resources/app.asar','runtime/node.exe','runtime/node_modules/npm/bin/npm-cli.js'])if(!fs.existsSync(path.join(base,file)))throw Error('Runtime component missing: '+file);
 if(fs.existsSync(output))throw Error('Payload exists; preserve it and remove build/payload explicitly before rebuilding');
 checkedTree(path.join(base,'app'));checkedTree(path.join(base,'runtime'));fs.mkdirSync(output,{recursive:true});
 for(const name of ['app','runtime'])fs.cpSync(path.join(base,name),path.join(output,name),{recursive:true});
 fs.cpSync(path.join(root,'agent'),path.join(output,'agent'),{recursive:true});fs.cpSync(path.join(root,'assets'),path.join(output,'assets'),{recursive:true});
 const meta={...manifest,date:'2026-10-13',displayName:`${manifest.name} v${manifest.version}-2026-10-13`,desktopIcon:'assets/agent.ico',packagingValidation:'structure_and_integrity_only'};
 fs.writeFileSync(path.join(output,'agent.json'),JSON.stringify(meta,null,2));
 const asar=require('@electron/asar');const archive=path.join(output,'app/BOSS-win32-x64/resources/app.asar'),stage=path.join(root,'build/asar-stage');
 asar.extractAll(archive,stage);fs.copyFileSync(path.join(root,'src/bootstrap.cjs'),path.join(stage,'boss-bootstrap.cjs'));fs.copyFileSync(path.join(root,'src/runtime-layout.cjs'),path.join(stage,'lawyer-runtime-layout.cjs'));
 await asar.createPackage(stage,archive+'.new');fs.renameSync(archive+'.new',archive);asar.uncacheAll();
 fs.writeFileSync(path.join(output,'launch.ps1'),'\uFEFF'+"$ErrorActionPreference='Stop'\r\nStart-Process -FilePath (Join-Path $PSScriptRoot 'app\\BOSS-win32-x64\\BOSS.exe') -WorkingDirectory $PSScriptRoot\r\n");
 fs.writeFileSync(path.join(output,'启动.cmd'),'@echo off\r\npowershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0launch.ps1"\r\n');
 for(const name of ['LICENSE-Goose','THIRD-PARTY-NOTICES.md','README.md'])fs.copyFileSync(path.join(root,name),path.join(output,name));
 fs.writeFileSync(path.join(output,'安装说明.txt'),'律师助手 0.1.0 · prototype\r\n\r\nWindows 10/11 x64。包含桌面程序、后端及 Node/npm，无需编译或安装开发工具。\r\n首次启动连接自己的模型账号/API。未包含离线模型、法律数据库或客户资料。\r\n已有律师使命和五项能力设计；自动法律业务、流程执行和 M4—M9 尚未实现。\r\n安装程序自动创建桌面和开始菜单“律师助手 UAH”入口。\r\n安装版配置/历史在 %LOCALAPPDATA%\\UAH-Lawyer\\Instances，更新或卸载保留。\r\n');
 const inventory=[];function visit(dir){for(const item of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())visit(file);else inventory.push({path:path.relative(output,file).replaceAll('\\','/'),sha256:hash(file)});}}visit(output);
 fs.writeFileSync(path.join(output,'release-manifest.json'),JSON.stringify({schema:'uah-lawyer-release/v0.1',name:manifest.name,version:manifest.version,mode:manifest.mode,files:inventory},null,2));
 console.log(output);
})().catch(error=>{console.error(error);process.exitCode=1;});
