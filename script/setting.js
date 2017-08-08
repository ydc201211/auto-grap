(function() {
   document.addEventListener('DOMContentLoaded', init);
   function init() {
       
        var setDate = document.getElementsByClassName("set-time")[0];
        var minCycle = document.getElementsByClassName("minCycle")[0];
        var maxCycle = document.getElementsByClassName("maxCycle")[0];
        var submit = document.getElementsByClassName("submit")[0];
        
        setDate.value =  store("endDate");
        minCycle.value = store("minCycle");
        maxCycle.value = store("maxCycle");

        submit.addEventListener("click",function(event) {
            var _this =  event.target;
            if(_this.className === "sure"){
                if(saveLocalStorage(setDate,minCycle,maxCycle)){
                    alert("恭喜你,修改成功!重新启动插件生效");
                    
                    window.close();
                }else{
                    alert("修改失败!");
                }
            }else{
                window.close();
            }
        })
    }

    function saveLocalStorage(setDate,minCycle,maxCycle){
        var status = false;
        if(checkCycletime(setDate)){
            if(minCycle.value > 0 && maxCycle.value > 0 && maxCycle.value - minCycle.value > 0){
                store("minCycle",minCycle.value);
                store("maxCycle",maxCycle.value);
            }else{
                store("minCycle","60");
                store("maxCycle","180");
            }
            setDate.value ? store("endDate", setDate.value) : store("endDate", "0");
            if(store("endDate") && store("minCycle") && store("minCycle")){
                status = true;
            }else{
                status = false;
            }
            return status;
        }else{
            alert("日期设置错误!");
            return status;
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