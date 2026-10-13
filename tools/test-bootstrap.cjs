const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),testRoot=path.join(root,'build/bootstrap-tests-'+Date.now());fs.mkdirSync(testRoot,{recursive:true});
const {layout}=require('../src/runtime-layout.cjs');
const installed=path.join(testRoot,'installed');fs.mkdirSync(installed);fs.writeFileSync(path.join(installed,'installation-mode.json'),'{}');
const env={LOCALAPPDATA:path.join(testRoot,'local')};const loc=layout(installed,env);
assert(!loc.profile.startsWith(installed+path.sep));assert.equal(layout(installed,env).profile,loc.profile);assert.notEqual(layout(path.join(testRoot,'other'),{...env,UAH_LAWYER_PROFILE_ROOT:path.join(testRoot,'override')}).profile,loc.profile);
assert.equal(layout(path.join(testRoot,'portable'),env).profile,path.join(testRoot,'portable'));
fs.writeFileSync(path.join(installed,'agent.json'),JSON.stringify({id:'uah-lawyer',name:'律师助手',version:'0.1.0',displayName:'律师助手 v0.1.0',desktopIcon:'assets/agent.ico',views:{M1:{files:['9m/M1.md']}}}));
fs.mkdirSync(path.join(installed,'agent/9m'),{recursive:true});fs.writeFileSync(path.join(installed,'agent/9m/M1.md'),'# Original lawyer definition');
const callbacks={},titles=[];const app={setName:n=>assert.equal(n,'uah-lawyer'),setPath:(key,p)=>assert.equal(p,loc.desktop),setAppUserModelId:()=>{},on:(name,fn)=>callbacks[name]=fn};
function boot(){const fakeProcess={resourcesPath:path.join(installed,'app/BOSS-win32-x64/resources'),env:{...env,UAHRAF9M_DATA_ROOT:'mother-data',GOOSE_EXTERNAL_BACKEND:'other',PATH:''},chdir:p=>assert.equal(p,loc.workspace)};
vm.runInNewContext(fs.readFileSync(path.join(root,'src/bootstrap.cjs'),'utf8'),{require:name=>name==='electron'?{app,dialog:{}}:name==='./lawyer-runtime-layout.cjs'?{layout:directory=>layout(directory,fakeProcess.env)}:name==='./.vite/build/main.js'?{}:require(name),process:fakeProcess});
assert(!fakeProcess.env.UAHRAF9M_DATA_ROOT);assert(!fakeProcess.env.GOOSE_EXTERNAL_BACKEND);assert.equal(fakeProcess.env.GOOSE_PATH_ROOT,loc.goose);
callbacks['browser-window-created']({}, {setIcon:()=>{},setTitle:title=>titles.push(title),on:()=>{},webContents:{once:(_event,fn)=>fn()}});}
boot();const instance=fs.readFileSync(path.join(loc.profile,'instance.json'),'utf8');
const config=path.join(loc.goose,'config/config.yaml');fs.writeFileSync(config,'provider: user-sentinel\nextensions: {}\n');boot();assert.equal(fs.readFileSync(path.join(loc.profile,'instance.json'),'utf8'),instance);assert(fs.readFileSync(config,'utf8').includes('user-sentinel'));
assert(fs.existsSync(path.join(loc.profile,'runtime-ready.json')));assert(titles.every(t=>t==='律师助手 v0.1.0'));assert(!fs.existsSync(path.join(installed,'data')));
console.log(JSON.stringify({passed:true,installedDataSeparated:true,portableDataLocal:true,configPreserved:true,instancePreserved:true,motherEnvironmentRemoved:true,bootstrapWindowCallback:true,scope:'Mocked Electron bootstrap; actual GUI tested separately'}));
