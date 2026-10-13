const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const i=process.argv.indexOf('--compiler');
const compiler=i>=0?process.argv[i+1]:process.env.INNO_SETUP_COMPILER;
if(!compiler||!fs.existsSync(compiler))throw Error('Supply --compiler <ISCC.exe> or INNO_SETUP_COMPILER');
const payload=path.join(root,'build/payload');if(!fs.existsSync(path.join(payload,'agent.json')))throw Error('Build the clean payload first');
const output=path.join(root,'releases');fs.mkdirSync(output,{recursive:true});
fs.writeFileSync(path.join(payload,'installation-mode.json'),JSON.stringify({schema:'uah-lawyer-installed/v0.1'}));
try{const log=execFileSync(compiler,[`/DPayload=${payload}`,`/DOutput=${output}`,path.join(root,'installer/lawyer.iss')],{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});fs.writeFileSync(path.join(root,'build/installer-compile.log'),log);console.log(path.join(output,'UAH-Lawyer-0.1.0-win-x64-Setup.exe'));}
finally{fs.unlinkSync(path.join(payload,'installation-mode.json'));}
