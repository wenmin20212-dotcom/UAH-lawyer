const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function layout(root,env=process.env){
 root=path.resolve(root);
 const installed=fs.existsSync(path.join(root,'installation-mode.json'));
 const identity=crypto.createHash('sha256').update(root.toLowerCase()).digest('hex').slice(0,20);
 if(installed&&!env.LOCALAPPDATA&&!env.UAH_LAWYER_PROFILE_ROOT)throw Error('Windows user data directory is unavailable');
 const profile=env.UAH_LAWYER_PROFILE_ROOT?path.resolve(env.UAH_LAWYER_PROFILE_ROOT):installed?path.join(env.LOCALAPPDATA,'UAH-Lawyer','Instances',identity):root;
 return {root,installed,identity,profile,workspace:path.join(profile,'workspace'),desktop:path.join(profile,'data/desktop'),goose:path.join(profile,'data/goose')};
}
module.exports={layout};
