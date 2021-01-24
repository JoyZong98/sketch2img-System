import "reflect-metadata"

import cors from '@koa/cors'
import multer from '@koa/multer'
import Router from '@koa/router'
import fs from 'fs'
import Koa from 'koa'
import morgan from 'koa-morgan'
import path from 'path'
import shellescape from 'shell-escape'
import shell from 'shelljs'
import { createConnection, IsNull, Not } from "typeorm"
import { v4 as uuidV4 } from 'uuid'
import { Work } from "./entity/Work"


async function main() {
  const app = new Koa()
  const router = new Router()
  const upload = multer();

  await createConnection()

  app.use(cors())
  app.use(morgan('combined'))

  router.get('/api/works', async (ctx, next) => {
    ctx.body = {
      rows: await Work.find({
        where: {
          outputFilePath: Not(IsNull())
        }
      })
    }
  })

  router.post('/api/works', upload.single('file'), async (ctx, next) => {
    const filename = uuidV4()
    const savePath = path.resolve(__dirname, `../files/upload/${filename}.png`)
    const generatePath = path.resolve(__dirname, `../files/generated/${filename}.png`)
    fs.writeFileSync(savePath, ctx.file.buffer)

    const work = new Work()
    work.inputFilePath = savePath
    work.outputFilePath = generatePath
    work.save()
    shell.exec(shellescape([
      'conda activate sketch2img'
    ]))
    shell.exec(shellescape([
      'python /Users/bytedance/Desktop/sketch2img-FE/pix2pix-pipeline/toFE_sketch2img.py',
      '--input',
      savePath,
      '--output',
      generatePath
    ]))
    ctx.body = work;
  })

  router.get('/api/works/:workId', async (ctx) => {
    const work = await Work.findOneOrFail(ctx.params.workId)

    ctx.body = work
  })

  router.get('/api/works/:workId/image.png', async (ctx) => {
    const work = await Work.findOneOrFail(ctx.params.workId)

    ctx.body = fs.readFileSync(work.outputFilePath)
  })

  app.use(router.routes()).use(router.allowedMethods())

  app.listen(3000)
}

main().then().catch(console.error)