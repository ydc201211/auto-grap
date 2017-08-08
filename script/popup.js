(function(){
    document.addEventListener('DOMContentLoaded', init);

    function init(){
        var winBackground = chrome.extension.getBackgroundPage();
      
        //为顶部btn设置点击事件
        var topBtn = document.querySelector(".top-btn");
        var grapAllBtn = document.getElementsByClassName("grap-all")[0];
        var startBtn = document.getElementsByClassName("start-auto")[0];
        var stopBtn = document.getElementsByClassName("stop-auto")[0];
        var reflush = document.getElementsByClassName("reflush")[0];
       

        if(store("isAuto")){
            if(store("isAuto") === "1"){
                startBtn.style.display = "none";
                stopBtn.style.display = "block";
            }else{
                startBtn.style.display = "block";
                stopBtn.style.display = "none";
            }
            
        }else{
            startBtn.style.display = "block";
            stopBtn.style.display = "none";
            
        }

        //初始化刷新次数
        showFlushTime(winBackground.getFlushTime());
        //初始化抓取单数
        
        showGrapOrderInfo(winBackground.getGrapOrderCount());

        topBtn.addEventListener("click",function(event){
            var _this = event.target;
            if(/start-auto/g.test(_this.className)){
                var tb = document.getElementById("list");
                tb.innerHTML = "开始加载。。。";
                grapAllBtn.style.display = "none";
                reflush.style.display = "none";
                _this.style.display = "none";
                stopBtn.style.display = "block";
                store("isAuto","1");
                winBackground.init();
            }else if(_this.className === "stop-auto"){
                var tb = document.getElementById("list");
                tb.innerHTML = "暂停加载。。。";
                reflush.style.display = "block";
                startBtn.style.display = "block";
                _this.style.display = "none";
                store("isAuto","0");
                winBackground.stopAutoGrap();
                
            }else if(/reflush/g.test(_this.className)){
                
                winBackground.reFlushData(); 
                // showFlushTime(winBackground.getFlushTime());
            }else{
                winBackground.grapAllClick();
                showFlushInfo("正在加载.....",500);
                winBackground.reFlushData(); 
            }
        },false);

        var tb = document.getElementById("list");
        tb.addEventListener("click",function(event){
            var target = event.target;

            if(/grap/g.test(target.className)){
                winBackground.grap(target.getAttribute("req-id"),target.getAttribute("plt-id"),target.getAttribute("pro-id"));
                winBackground.reflush();
            }
        },false);

        //设置监听函数
         chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
            if(request.once){
                if(request.data.Data.Items !== null){
                    grapAllBtn.style.display = "block";
                }
                showFlushTime(request.count);
                if(request.data.Data.Items === null){
                    showFlushInfo("暂时没有单子额！",800);
                }else{
                    setTimeout(function(){
                        request.data && dataToHtml(request.data);
                    },600)
                    
                }
            }else if(request.grap){
                showGrapOrderInfo(request.grapOrderCount);
            }else{
                showFlushInfo("正在加载数据......",500);
                request.data && dataToHtml(request.data);
            }

            request.data && showFlushTime(request.count);
        });

    }

    //显示抢到单数
    function showGrapOrderInfo(grapOrderCounts){
        var grapOrderCount = document.getElementById("grapOrderCount");
        grapOrderCount.innerHTML = grapOrderCounts;
    }

    //显示刷新次数
    function showFlushTime(count){
        var flushTime = document.getElementById("count");
        flushTime.innerHTML = count;
    }
    //渲染页面
    function dataToHtml(data){
       
        var tb = document.getElementById("list");
        var items = data.Data.Items || [];
        var nodeStr = "";
        
        for(var a = 0; a < items.length;a++){
            var minBudget = "";
            if(items[a].MinBudget === 999999.0){
                minBudget = "不限";
            }else if(items[a].MinBudget === -1){
                minBudget = "无明确预算";
            }else{
                 minBudget = items[a].MinBudget;
            }
            var linedata =  
            "<tr>"+
                "<td>"+items[a].OrderID +"</td>"+
                "<td>"+items[a].OrderCreateTimeAlert +"</td>"+
                "<td>"+items[a].TravelNature +"</td>"+
                "<td>"+items[a].Departure +"</td>"+
                "<td>"+items[a].Destination +"</td>"+
                "<td>"+items[a].MinDepartureDate +"</td>"+
                "<td>"+minBudget+"</td>"+
                "<td>"+items[a].Remark+"</td>"+
                "<td>"+items[a].OrderStatusName+"</td>"+
                "<td>"+"<a class='grap' href='javascript:;' pro-id='" + items[a].PlatformProviderID + "' plt-id='" + items[a].PlatformUserID + "' req-id='" + items[a].RequireDetailID + "'>抢单</a></td>"+
            "</tr>";
            nodeStr+=linedata;
        }
        tb.innerHTML = nodeStr || "<tr><td>暂时没有单子！</td></tr>";
    }

    function showFlushInfo(text,timeout){
        setTimeout(function() {
            var tb = document.getElementById("list");
            tb.innerHTML = text;
        },timeout);
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

    function checkCycletime(setDate){
        var tempDate = new Date(setDate.value.replace("T"," "));
        var currDate = new Date();
        if(Number(tempDate.getTime()) - Number(currDate.getTime()) <= 0){
            return false;
        }else{
            return true;
        }
    }
})();
