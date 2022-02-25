import { getRandomStr } from '../utils/DC_PublicFunc/index'

const ROOT_PATH = wx.env.USER_DATA_PATH // 用户根路径
const EXPERIMENTS_DIRNAME = '/experiments' // 实验记录存放目录名
const LOCAL_DIRNAME = '/local' // 本地实验存储目录名
const ONLINE_DIRNAME = '/online' // 在线实验缓存目录名
const IMAGES_DIRNAME = '/images' // 图片存放目录名
const RECORD_FILENAME = '/index.json' // 实验记录文件名

function FileManager() {
    const FS = wx.getFileSystemManager() // 文件管理器

    this.FS = FS
    this.ROOT_PATH = ROOT_PATH
    this.EXPERIMENTS_DIRNAME = EXPERIMENTS_DIRNAME
    this.LOCAL_DIRNAME = LOCAL_DIRNAME
    this.ONLINE_DIRNAME = ONLINE_DIRNAME
    this.IMAGES_DIRNAME = IMAGES_DIRNAME
    this.RECORD_FILENAME = RECORD_FILENAME

    const EXPER_DIRNAME = 'experiment' // 本页面的存储目录名
    const DIR_LOCAL_NAME = 'local' // 样本本地存储目录名
    const JSON_LOCAL_NAME = 'index.json' // 样本json本地存储名

    this.EXPER_DIRNAME = EXPER_DIRNAME
    this.DIR_LOCAL_NAME = DIR_LOCAL_NAME
    this.JSON_LOCAL_NAME = JSON_LOCAL_NAME

    this.DIR_LOCAL_PATH = `${ROOT_PATH}/${EXPER_DIRNAME}/${DIR_LOCAL_NAME}` // 样本本地存储路径
    this.DIR_IMAGES_PATH = `${ROOT_PATH}/${EXPER_DIRNAME}/${DIR_LOCAL_NAME}/images` // 样本图片本地存储路径
    this.JSON_LOCAL_PATH = `${ROOT_PATH}/${EXPER_DIRNAME}/${DIR_LOCAL_NAME}/${JSON_LOCAL_NAME}` // 样本json本地存储路径
}
// 初始化文件系统
FileManager.prototype.init = function () {
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME) // 检查实验记录路径是否存在
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME, true) // 创建实验记录目录
    }
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME + LOCAL_DIRNAME) // 检查本地实验存储目录是否存在
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME + LOCAL_DIRNAME, true) // 创建本地实验存储目录
    }
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME + ONLINE_DIRNAME) // 检查在线实验缓存目录是否存在
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME + ONLINE_DIRNAME, true) // 创建在线实验缓存目录
    }
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME + IMAGES_DIRNAME) // 检查图片存放目录是否存在
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME + IMAGES_DIRNAME, true) // 创建图片存放目录
    }
}
// 创建一个本地实验记录文件夹
FileManager.prototype.createExperimentLocalDir = function (recordName = '') {
    const date = new Date()
    const dateName = date.getTime()
    const randomStr = getRandomStr(5)
    const dirName = `/${dateName}_${randomStr}_${recordName}`
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME + LOCAL_DIRNAME + dirName) // 检查该目录是否存在
        // 若存在 说明文件名重复 返回null
        return null
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME + LOCAL_DIRNAME + dirName, true)
        // 若不存在 则创建目录 返回目录名
        return dirName
    }
}
// 创建一个在线实验记录缓存文件夹
FileManager.prototype.createExperimentOnlineDir = function (lab_id = '') {
    const date = new Date()
    const dateName = date.getTime()
    const randomStr = getRandomStr(5)
    const dirName = `/${dateName}_${randomStr}_${lab_id}_在线实验记录`
    try {
        this.FS.accessSync(ROOT_PATH + EXPERIMENTS_DIRNAME + ONLINE_DIRNAME + dirName) // 检查该目录是否存在
        // 若存在 说明文件名重复 返回null
        return null
    } catch (e) {
        this.FS.mkdirSync(ROOT_PATH + EXPERIMENTS_DIRNAME + ONLINE_DIRNAME + dirName, true)
        // 若不存在 则创建目录 返回目录名
        return dirName
    }
}
// 创建实验记录json模版
FileManager.prototype.createExperimentJSON = function (path) {
    const josnObj = {
        guideSampleList: [], // 标样列表
        sampleList: [], // 样本列表
        densityRemark: '无',
    }
    return this.saveJSON(`${path}${this.RECORD_FILENAME}`, JSON.stringify(josnObj))
}
// 创建标样记录对象
FileManager.prototype.createGuideSample = function (options = {}) {
    const guideSampleObj = {
        sampleName: options.sampleName !== undefined ? options.sampleName : '', // 标样名
        path: options.path !== undefined ? options.path : '',
        width: options.width !== undefined ? options.width : 0,
        height: options.height !== undefined ? options.height : 0,
        pointSet: options.pointSet instanceof Array ? options.pointSet : [],
        posX: options.posX !== undefined ? options.posX : 0,
        avarage: options.avarage !== undefined ? options.avarage : null,
        density: options.density !== undefined ? options.density : '',
        densityRemark: options.densityRemark !== undefined ? options.densityRemark : '',
    }
    return guideSampleObj
}
// 读取给定path的JSON文件
FileManager.prototype.loadJSON = function (path) {
    try {
        const fd = this.FS.openSync({
            filePath: path,
            flag: 'r',
        })
        const json = this.FS.readFileSync(path, 'utf-8')
        this.FS.closeSync({ fd })
        return json
    } catch (e) {
        return false
    }
}
// 写入给定path的JSON文件
FileManager.prototype.saveJSON = function (path, json) {
    try {
        const fd = this.FS.openSync({
            filePath: path,
            flag: 'w',
        })
        this.FS.writeFileSync(path, json, 'utf-8')
        this.FS.closeSync({ fd })
        return true
    } catch (e) {
        return false
    }
}
// 删除一个文件夹涉及的文件数据
FileManager.prototype.deleteDir = function (path) {
    try {
        const jsonData = this.loadJSON(`${path}/${this.RECORD_FILENAME}`)
        const jsonObj = JSON.parse(jsonData)
        const {guideSampleList,sampleList} = jsonObj
        let delPaths = []
        for(let i of guideSampleList){
            delPaths.push(i.path)
        }
        for(let i of sampleList){
            delPaths.push(i.path)
        }
        this.FS.rmdirSync(path,true)
        for(let i of delPaths){
            this.FS.unlinkSync(i)
        }
        return true
    } catch (e) {
        return false
    }
}
// 清空存储的数据
FileManager.prototype.clear = function () {
    try {
        this.FS.rmdirSync(this.ROOT_PATH + this.EXPERIMENTS_DIRNAME, true) // 删除所有样本图片本地存储目录
    } catch (e) {}
    this.init()
}

// 检查目录和文件并完成创建
FileManager.prototype.check = function () {
    if (!this.checkPathLocal()) {
        // 若未存在样本本地存储目录
        this.createPathLocal() // 创建样本本地存储目录
    }
    if (!this.checkJSONLocal()) {
        // 若未存在样本本地存储JSON
        this.createJSONLocal() // 创建样本本地存储JSON
    }
}
// 检查本地样本存储目录是否存在
FileManager.prototype.checkPathLocal = function () {
    let flag = true
    try {
        this.FS.accessSync(this.DIR_LOCAL_PATH)
    } catch (e) {
        flag = false
    }
    try {
        this.FS.accessSync(this.DIR_IMAGES_PATH)
    } catch (e) {
        flag = false
    }
    return flag
}
// 创建本地样本存储目录（）
FileManager.prototype.createPathLocal = function () {
    let flag = true
    try {
        this.FS.mkdirSync(this.DIR_LOCAL_PATH, true)
        this.FS.mkdirSync(this.DIR_IMAGES_PATH, true)
    } catch (e) {
        flag = false
    }
    return flag
}
// 检查样本本地存储JSON是否存在
FileManager.prototype.checkJSONLocal = function () {
    let flag = true
    try {
        this.FS.accessSync(this.JSON_LOCAL_PATH)
        return true
    } catch (e) {
        flag = false
    }
    return flag
}
// 创建本地样本存储目录（）
FileManager.prototype.createJSONLocal = function () {
    let flag = true
    try {
        const fd = this.FS.openSync({
            filePath: this.JSON_LOCAL_PATH,
            flag: 'a+',
        })
        this.FS.closeSync({ fd })
    } catch (e) {
        flag = false
    }
    return flag
}

module.exports = {
    FileManager,
}
