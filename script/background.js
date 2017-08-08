
    var dataList=[];
    var indexArray = [];
    var auto = "";
    var count = 0;
    var grapOrderCount = 0;
    //add event listener
    function startBtn(){
         document.addEventListener('DOMContentLoaded', init);
    }

    function init(){
        store("isAuto","1")
        store("maxCycle","180");
        store("minCycle","60");
        store("endDate","0");
        startAutoGrap();
    }

    function getFlushTime(){
        return count;
    }
    function getGrapOrderCount(){
        return grapOrderCount;
    }
    function startAutoGrap(){
        
        var currDate = new Date();
        var currTime = currDate.getTime();
        var endDate = "";
        var cycleTime = "";
        var endTime = "";
        var tempDate = "";
        var maxCycle = "";
        var minCycle = "";

        if(store("isAuto") === "1"){
            if(store("endDate") !== "0"){
                endDate = store("endDate");
                tempDate = new Date(endDate.replace("T"," "));
                endTime = tempDate.getTime();
                minCycle = store("minCycle");
                maxCycle = store("maxCycle");
                cycleTime =Number(endTime) - Number(currTime);
    
                auto = setInterval(function() {
                    console.log(Math.floor((Math.random()* (Number(maxCycle)-Number(minCycle)) + Number(minCycle))*1000));
                    getListData(function(data){
                        count++;
                        chrome.extension.sendMessage({
                            data:data,
                            count: count
                        },function(response){
                            
                        });
                        grapAllClick();
                    });
                },Math.floor((Math.random()* (Number(maxCycle)-Number(minCycle)) + Number(minCycle))*1000));
                setTimeout(function() {
                    stopAutoGrap();
                }, cycleTime);
               
            }else{
                minCycle = store("minCycle");
                maxCycle = store("maxCycle");

                auto = setInterval(function() {
                    console.log(Math.floor((Math.random()* (Number(maxCycle)-Number(minCycle)) + Number(minCycle))*1000));
                    getListData(function(data){
                        count++;
                        chrome.extension.sendMessage({
                            data:data,
                            count: count
                        },function(response){
                            
                        }); 
                        grapAllClick();
                    });
                },Math.floor((Math.random()* (Number(maxCycle)-Number(minCycle)) + Number(minCycle))*1000));
            }
        }
    }

    function stopAutoGrap(){
        clearInterval(auto);
    }

    function getListData(callback,fail){
        ajax("http://vbooking.ctrip.com/dingzhi/GrabRequire/GetRequireList?random=77&&pageIndex=1&pageSize=15&orderType=GrabOrder&isAll=true",{
            type:"GET",
            async:true,
            success: function(data){
                dataList =data.Data.Items;
                callback(data);
            },
            fail : function(data){
                if(/txtPwd/img.test(data)){
                    stopAutoGrap();
                    notify({
                        title : "错误！",
                        msg : "请点击登录系统并计入到【定制旅行】！"
                    },{
                        click : function(){
                            window.open("http://vbooking.ctrip.com/Dingzhi/dispatch");
                        }
                    });
                }else{
                    // fail(data);
                }
            }
        });
    }

    //单个抢单
    function grap(reqid,pltid,proid){
        var paras = {
            requireDetailId: reqid,
            platformUserId: pltid,
            platformProviderId: proid,
            orderType: "GrabOrder"
        };
        ajax("http://vbooking.ctrip.com/dingzhi/GrabRequire/Submit",{
            type: "POST",
            param :paras,
            success : function(data){
                if(data &&　data.Success){
                    grapOrderCount++;
                     chrome.extension.sendMessage({
                            grapOrderCount: grapOrderCount,
                            grap:"grap"
                        },function(response){
                            
                        });
                
                    notify({
                        title : "抢单成功！",
                        msg : data.Message || "抢单成功！"
                    });                   
                }else{
                    notify({
                        title : "错误！",
                        msg : data.Message || "抢单失败！"
                    });
                }
            },
            fail : function(){

            }
        });
    }
    
    //一键抢单
    function grapAllClick() {
        for(var index in dataList){
            var paras = {
                requireDetailId: dataList[index].RequireDetailID,
                platformUserId: dataList[index].PlatformUserID,
                platformProviderId: dataList[index].PlatformProviderID,
                orderType: "GrabOrder"
            };
            ajax("http://vbooking.ctrip.com/dingzhi/GrabRequire/Submit",{
                type: "POST",
                param :paras,
                success : function(data){
                    if(data &&　data.Success){
                        grapOrderCount++;
                         chrome.extension.sendMessage({
                            grapOrderCount: grapOrderCount,
                            grap:"grap"
                        },function(response){
                            
                        });
                        notify({
                            title : "需求单号为"+ dataList[index].OrderID + "抢单成功！",
                            msg : data.Message || "抢单成功！"
                        });
                    }else{
                        notify({
                            title :"需求单号为"+ dataList[index].OrderID + "抢单失败！",
                            msg : data.Message || "抢单失败！"
                        });
                    }
                },
                fail : function(){

                }
            });
            
            //设置抢单随机秒数
            setTimeout(function(){
        
            },Math.round((Math.random()* 7 + 3) * 1000));
        }
    }

    function reFlushData(){
        getListData(function(data){
            count++;
            chrome.extension.sendMessage({
                data:data,
                count: count,
                once:"once"
            },function(response){
                
            });
        });
    }

    function getCookies(callback){
        chrome.cookies.getAll({url : "http://vbooking.ctrip.com"},function(cookies){
            if(cookies && cookies.length){
                cookies.forEach(function(item){
                    document.cookie = fmt(item);
                });
            }
            callback(cookies);
        });

        function fmt(ck){
            var str = ck.name + "=" + ck.value;
            return str;
        }
    }

    function ajax(url,data){
        data = data || {};
        getCookies(function(){
        　　var type = data.type.toUpperCase() || 'GET'; //默认为GET请求
        　　url = url || ''; //请求路径
        　　var async = data.async || true;  //是否异步
        　　var param = data.param || null;  
        　　var success = data.success || function(){};//请求成功回调函数
            var fail = data.fail || function(){};//请求失败回调函数
        　　var xhr = null;//初始化XMLHttpRequest对象
        　  xhr = new XMLHttpRequest();
        　　var params = [];//url参数  
        　　for (var key in param){
        　　　　params.push(key + '=' + param[key]);
        　　}
        　　var paramsString = params.join('&');

        　　if (type === 'POST') {
        　　　　xhr.open(type, url, async);
        　　　　xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        　　　　xhr.send(paramsString);
        　　}else {
        　　　　xhr.open(type, url + '?' + params, async);
        　　　　xhr.send(null);
    　　    }
        　　xhr.onreadystatechange = function(){
        　　　　if (xhr.readyState == 4) {
                    if(xhr.status >= 200 && xhr.status <300){
                        try{
                            success(JSON.parse(xhr.responseText));
                        }catch(err){
                            fail && fail(xhr.responseText);
                            notify({
                                title : "错误！",
                                msg : "数据格式有误！" + err
                            });                    
                        }
                    }else{
                        fail && fail(xhr.responseText);
                        notify({
                            title : "错误！",
                            msg : "获取数据失败！" + xhr.responseText,
                        }); 
                    }
        　　　　}
        　　};
        });
    }

     function notify(opts,events){
        var Notification = window.Notification;
        if(Notification){
            if(Notification.permission === "granted"){
                var n = new Notification(opts.title || "您有新消息了！",{
                    icon : "../image/icon.png",
                    body : opts.msg
                });
                events = events || {};

                for(var ev in events){
                    n["on" + ev] = events[ev];
                }
            }else{
                Notification.requestPermission().then(function(result){
                    if(result === "granted"){
                        notify(opts);
                    }else{
                        alert("没有获取到权限！");
                    }
                });
            }
        }else{
            alert("您的浏览器不支持桌面通知特性，请下载谷歌浏览器试用该功能");
        }
    }

    function store(){
        return store[["get","set"][arguments.length - 1]].apply(null,[].slice.call(arguments));
    }

    store.get = function(key){
       return localStorage.getItem(key);
    }

    store.set = function(key,value){
         localStorage.setItem(key,value);
         return store;
    }