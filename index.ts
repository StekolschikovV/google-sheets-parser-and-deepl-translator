import Table from "./src/table";
import fsExtra from 'fs-extra'
import fs from 'fs'

const table = new Table()

const run = async () => {

  const sheetUrl = "URL"
  await table.getTable(sheetUrl)
  const tableJsons = await table.generateObj()
  const dirPath = '../frontend/resources/assets/i18n/'
  const translationsJsPath = '../frontend/resources/assets/i18n/translations.js'
  const translationsJsPathNew = '../frontend/resources/assets/translations.js'

  // fs.renameSync(translationsJsPath, translationsJsPathNew)
  // fsExtra.emptyDirSync(dirPath);
  // fs.renameSync(translationsJsPathNew, translationsJsPath)

  // for (let i = 0; i < tableJsons.length; i++) {
  //   const dirName = tableJsons[i].code.toLowerCase()
  //   const json = JSON.stringify(tableJsons[i], null, ' ')
  //   fs.mkdirSync(dirPath + dirName);
  //   fs.writeFileSync(dirPath + dirName + "/translation.json", json);
  // }

}

run()