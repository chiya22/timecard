const datadir = './data';
const masterfile = datadir + '/master/userlist.dat';

const fs = require('fs');
const readline = require('readline');

/*
データディレクトリに
マスタに登録されているユーザIDのディレクトリが存在しない場合、
ディレクトリを作成する
*/
const initialize = function () {
    fs.stat(masterfile, (err) => {
        if (err) {
            if (err.code === "ENOENT") {
                console.log('マスタファイルが存在しません');
            } else {
                console.log(err);
            }
        } else {
            const rs = fs.createReadStream(masterfile);
            const ri = readline.createInterface({
                input: rs
            });
            ri.on('line', (linestring) => {
                const userdataarray = linestring.split(',');
                if (!fs.existsSync(datadir + '/' + userdataarray[0])) {
                    fs.mkdirSync(datadir + '/' + userdataarray[0]);
                }
            })
        }
    });
}
/*
マスタに登録されているユーザ情報を配列で返却する
kubun：指定なし→全員、1→社員のみ、2→アルバイトのみ
*/
const getUserList = (kubun) => {
    let ret = [];
    let filecontent = fs.readFileSync(masterfile, 'utf-8');
    const userlist = filecontent.split('\n');

    userlist.forEach( (user) => {
        if (user !== '') {
            let userinfo = user.split(',');
            if (!kubun) {
                ret.push({
                    'id': userinfo[0],
                    'name': userinfo[1],
                    'kubun': userinfo[2],
                })
            }else{
                if (userinfo[2] == kubun){
                    ret.push({
                        'id': userinfo[0],
                        'name': userinfo[1],
                        'kubun': userinfo[2],
                    })
                }
            }
        }
    })
    return ret;
};

module.exports = {
    initialize,
    getUserList,
};
