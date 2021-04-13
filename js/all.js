
let data = [];

//用 axios 撈 JSON 資料
axios.get('https://raw.githubusercontent.com/hexschool/js-training/main/travelApi.json')
    .then(function (response) {

        addData(response);

    });

//選單區宣告
const formList = document.querySelector('#formList');
const ticketName = document.querySelector('#ticketName');
const imgUrl = document.querySelector('#imgUrl');
const area = document.querySelector('#area');
const price = document.querySelector('#price');
const num = document.querySelector('#num');
const star = document.querySelector('#star');
const introduce = document.querySelector('#introduce');
const submitBtn = document.querySelector('.btn');

//選取表單全部
const formNull = document.querySelectorAll('#formList input[type="text"],#formList input[type="number"],#formList select,#formList textarea');

//下拉式塞選選單宣告
const searchArea = document.querySelector('#searchArea');
const searchNum = document.querySelector('#searchNum');

//套票顯示區宣告
let travelList = document.querySelector('.travelCardList');


function renderTicket(item){
    
    let str = `<li class="col-md-6 col-lg-4">
        <a class="travelCard" href="#">
            <div class="travelCard-header">
                <p class="locationText">${item.area}</p>
                <img class="travelImg" src="${item.imgUrl}" alt="${item.name}">
                <p class="groupScore">${item.rate.toFixed(1)}</p>
            </div>
            <div class="travelCard-body">
                <h3 class="travelCard-title">${item.name}</h3>
                <p class="travelCard-text">
                    ${item.description}
                </p>
                <div class="travelCard-footer">
                    <p>
                        <span class="material-icons">
                            error
                        </span>
                        剩下最後 <span id="groupNum">${item.group}</span> 組
                    </p>
                    <p>TWD<span class="groupPrice">$${item.price}</span></p>
                </div>
            </div>
        </a>
    </li>`

    return str;
}

//顯示全部旅遊套票
function showALL(){

    let ticket = "";
    let count = 0;

    data.forEach(function(item){
        count ++;
        ticket += renderTicket(item);
    })
    
    searchNum.textContent = count;
    travelList.innerHTML = ticket;

}

//顯示篩選過的旅遊套票
function showSelect(mode){

    let ticket = "";
    let count = 0;

    data.forEach(function(item){
        if(item.area == mode){
            count ++;
            ticket += renderTicket(item);
        }
    })

    searchNum.textContent = count;
    travelList.innerHTML = ticket;

}


//validate.js 套件用法
function checkForm(){

    const constraints = {
        "套票名稱": {
            presence: {
                message: "必填!"
            }
        },
        "圖片網址": {
            presence: {
                message: "必填!"
            },
            url: {
                schemes: ["http", "https"],
                message: "格式錯誤"
            }
        },
        "景點地區": {
            presence: {
                message: "必填!"
            }
        },
        "套票金額": {
            presence: {
                message: "必填!"
            },
            numericality: {
                greaterThan: 0,
                message: "金額必須大於0!"
            }
        },
        "套票組數": {
            presence: {
                message: "必填!"
            },
            numericality: {
                greaterThan: 0,
                message: "套票數量必須大於0!"
            }
        },
        "套票星級": {
            presence: {
                message: "必填!"
            },
            numericality: {
                greaterThanOrEqualTo: 1,
                lessThanOrEqualTo: 10,
                message: "星級必須大於0小於11!"
            }
        },
        "套票描述": {
            presence: {
                message: "必填!"
            },
            length: {
                maximum: 100
            }
        }
    }
    
    formNull.forEach(function(item){

        item.nextElementSibling.textContent = "";
        item.classList.remove('error');
        
    })

    let error = validate(formList, constraints);
    
    let isError = false;

    if(error){

        isError = true;
        Object.keys(error).forEach(function(key){
            
            let errorMessage =  document.getElementsByName(key);
            
            errorMessage[0].classList.add('error');
            errorMessage[0].nextElementSibling.textContent = error[key];


        })
        
    }

    return isError;
    
}


//輸入和點擊input就檢查--------------------
formNull.forEach(function(item){

    item.addEventListener('blur',function(e){

        checkForm();

    })
    
})


//初始畫面(用 axios 撈外部 JSON 資料)
function addData(response){

    data = response.data.data;
    showALL();
    newAreaData();
}

//C3.js套件 地點區域資料整理
function newAreaData(){

    //以下為整理area資料
    let dataAttributes = [];   //用來儲存所有data的屬性
    let areaValue = [];        //用來儲存所有 area 屬性的值
    data.forEach(function(item){

        dataAttributes = Object.keys(item);      //抓取並儲存所有data的屬性
        areaValue.push(item[dataAttributes[3]]); //抓取並儲存所有area屬性的值

    })
    

    let areaNum = {};      //儲存整理過的area數量
    areaValue.forEach(function(item){

        if(areaNum[item] == undefined){
            //areaNum物件裡沒有 item 值，就賦予新的"item"屬性`、與屬性值 1
            areaNum[item] = 1;
        }else{
             //areaNum物件有 item 值，就將屬性值 +1
            areaNum[item] += 1;
        }
       
    })
    

    let c3_AreaAry = [];        //儲存整理成c3套件要求的格式
    let areaName = Object.keys(areaNum);
    areaName.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(areaNum[item]);
        c3_AreaAry.push(ary);
    })
   

    //C3套件程式碼
    let chart = c3.generate({
        bindto: '#chart',
        data: {
          columns: c3_AreaAry,
          type: 'donut',
          colors:{
            台北:"#37547C",
            台中:"#67769F", 
            高雄:"#CCBAC9"
          }
        },
        donut: {
            title: "套票地區比重",
            label:{
                show: false
            },
            width: 25,
            size:{
                height: 160,
                weight: 160
            }
        }
        
    });

}

//新增旅遊套票
submitBtn.addEventListener('click',function(e){

    //停止預設動作
    e.preventDefault;

    let formIsError = checkForm();

    //檢查條件都false才能新增
    if(!formIsError){
        data.push({
            id : data.length,
            name : ticketName.value,
            imgUrl : imgUrl.value,
            area : area.value,
            description : introduce.value,
            group : Number(num.value),
            price : Number(price.value),
            rate : Number(star.value)
        })
        showALL();
        newAreaData();
        alert("新增成功!");
        formList.reset(); //新增後清除表單裡的資料
        searchArea.value = "全部地區";
    }
    
})


//篩選旅遊套票
searchArea.addEventListener('click',function(e){
    
    if(e.target.value == "全部地區"){

        showALL();

    }else if(e.target.value == "台北"){
        
        showSelect("台北");

    }else if(e.target.value == "台中"){

        showSelect("台中");
        
    }else if(e.target.value == "高雄"){

        showSelect("高雄");
        
    }

})

