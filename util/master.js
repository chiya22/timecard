const datadir = './data';
const masterfile = datadir + '/master/userlist.dat';

const fs = require('fs');

/*
データディレクトリに
マスタに登録されているユーザIDのディレクトリが存在しない場合、
ディレクトリを作成する
*/
const initialize = function () {
    try {
        fs.statSync(masterfile);

        let filecontent = fs.readFileSync(masterfile, 'utf-8');
        const userlist = filecontent.split('\n');

        userlist.forEach( (user) => {
            if (user !== '') {
                const userdataarray = user.split(',');
                if (!fs.existsSync(datadir + '/' + userdataarray[0])) {
                    fs.mkdirSync(datadir + '/' + userdataarray[0]);
                };
            };
        });
    } catch(err) {
        if (err.code === "ENOENT") {
            console.log('マスタファイルが存在しません');
        } else {
            throw err;
        }
    };
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

/*
引数で渡されたidをもとにマスタに登録されているユーザ情報を取得し返却する
*/
const getUser = (id) => {
    let ret = {};
    let userlist = getUserList();
    userlist.forEach((userinfo) => {
        if (userinfo.id === id) {
            ret = userinfo;
        }
    });
    return ret;
}

module.exports = {
    initialize,
    getUserList,
    getUser,
};
