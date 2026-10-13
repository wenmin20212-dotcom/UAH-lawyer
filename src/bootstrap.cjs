// Derived from the UAH standalone bootstrap. Modified for independent lawyer releases.
const {app,dialog}=require('electron'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),YAML=require('yaml');
const root=path.resolve(process.resourcesPath,'../../..');
let profile=root;
try{
 const meta=JSON.parse(fs.readFileSync(path.join(root,'agent.json'),'utf8'));
 const location=require('./lawyer-runtime-layout.cjs').layout(root);
 profile=location.profile;
 const configRoot=path.join(location.goose,'config');
 for(const directory of [location.workspace,location.desktop,configRoot])fs.mkdirSync(directory,{recursive:true});
 const instanceFile=path.join(profile,'instance.json');
 if(!fs.existsSync(instanceFile))fs.writeFileSync(instanceFile,JSON.stringify({schema:'uah-lawyer-instance/v0.1',instanceId:crypto.randomUUID(),appId:meta.id},null,2));
 for(const key of ['UAHRAF9M_DATA_ROOT','UAHRAF9M_CHILDREN_ROOT','UAHRAF9M_WORK_REGISTRY_ROOT','UAH_REQUIRE_CAPABILITY_POLICY','UAH_CAPABILITY_POLICY','GOOSE_EXTERNAL_BACKEND','GOOSE_EXTERNAL_BACKEND_URL','GOOSE_BINARY'])delete process.env[key];
 process.env.UAH_RUNTIME_MODE='native';process.env.GOOSE_PATH_ROOT=location.goose;process.env.BOSS_DESKTOP_DATA=location.desktop;process.env.GOOSE_WORKING_DIR=location.workspace;process.env.BOSS_DISPLAY_NAME=meta.displayName;
 process.env.PATH=path.join(root,'runtime')+path.delimiter+(process.env.PATH||'');
 app.setName(meta.id);app.setAppUserModelId?.('UAH.Lawyer');app.setPath('userData',location.desktop);process.chdir(location.workspace);
 const configPath=path.join(configRoot,'config.yaml');
 const config=fs.existsSync(configPath)?YAML.parse(fs.readFileSync(configPath,'utf8'))||{}:{};
 config.extensions=config.extensions||{};
 fs.writeFileSync(configPath,YAML.stringify(config));
 const hints=Object.entries(meta.views).flatMap(([view,v])=>v.files.filter(file=>file.endsWith('.md')).map(file=>`## ${view}: ${file}\n`+fs.readFileSync(path.join(root,'agent',file),'utf8')));
 fs.writeFileSync(path.join(configRoot,'.goosehints'),`# ${meta.name}\n这是 prototype，已有职业设计不表示法律业务或自动流程已经实现。资料不足明确说明，不编造法律依据或调用回执。\n`+hints.join('\n\n'));
 app.on('browser-window-created',(_event,window)=>{
  if(meta.desktopIcon)window.setIcon(path.join(root,meta.desktopIcon));
  window.on('page-title-updated',event=>{event.preventDefault();window.setTitle(meta.displayName);});
  window.webContents.once('did-finish-load',()=>{
   window.setTitle(meta.displayName);
   fs.writeFileSync(path.join(profile,'runtime-ready.json'),JSON.stringify({windowLoaded:true,appId:meta.id,version:meta.version,displayName:meta.displayName,profile:location.profile,workspace:location.workspace},null,2));
  });
 });
 require('./.vite/build/main.js');
}catch(error){
 try{fs.mkdirSync(profile,{recursive:true});fs.writeFileSync(path.join(profile,'startup-error.log'),String(error.stack));}catch{}
 app.whenReady().then(()=>{dialog.showErrorBox('律师助手启动失败',error.message);app.quit();});
}
