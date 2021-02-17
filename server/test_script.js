// // import shellescape from 'shell-escape'
var exec = require('child_process').exec;
var shellescape = require('shell-escape');
const savePath = '/Users/bytedance/Desktop/sketch2img-FE/server/files/upload/f4d389a2-0a7c-468c-8c06-568906e3d361.png';
const generatePath = '/Users/bytedance/Desktop/sketch2img-FE/server/files/generated/f4d389a2-0a7c-468c-8c06-568906e3d361.png';
exec(shellescape([
      'python',
      '/Users/bytedance/Desktop/sketch2img-FE/pix2pix-pipeline/toFE_sketch2img.py',
      '--input',
      savePath,
      '--output',
      generatePath
    ]),function(error,stdout){
      if(stdout.length >1){
        console.log('print in .py file',stdout);
      }
      if(error) {
        console.info('error : '+error);
      }
  }
)
