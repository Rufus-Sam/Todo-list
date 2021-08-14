module.exports = {
	logic: function(to_do, quantum, workingHoursPerDay) {
		
		var ffcs = JSON.parse(JSON.stringify(to_do));
		var sjf = JSON.parse(JSON.stringify(to_do));
		var priority = JSON.parse(JSON.stringify(to_do));
		var round_robin = JSON.parse(JSON.stringify(to_do));


		n = to_do.length
		// quantum = 2
		// workingHoursPerDay = 12
		hours = 0

		var wt_F = 0, wt_S = 0, wt_P = 0, wt_R = 0, tat_F = 0, tat_S = 0, tat_P = 0, tat_R = 0;
		function FFCS(works){
			var ct = 0;
			for(var i=0;i<n;i++){
				ct += works[i].bt;
				tat_F += ct;
				wt_F += ct - works[i].bt;
			}
		}

		function SJF(works){
			works.sort(function(a,b) {
				return a.bt - b.bt;
			});
			var ct = 0;
			for(var i=0;i<n;i++){
				ct += works[i].bt;
				tat_S += ct;
				wt_S += ct - works[i].bt;
			}
		}

		function PRIORITY(works){
			works.sort(function(a, b) {
				return b.priority - a.priority;
			});
			var ct = 0;
			for(var i=0;i<n;i++){
				ct += works[i].bt;
				tat_P += ct;
				wt_P += ct - works[i].bt;
			}
		}


		function ROUND_ROBIN(works){
			rr = []
			flag = 1
			hh = 0
			ct = 0
			var tem = new Array(n);
			for(var i=0;i<n;i++) { tem[i] = (works[i].bt); }
			
			while(flag){
				flag = 0
				for(i=0;i<n;i++){
					if(works[i].bt){
						flag = 1
						if(works[i].bt <= quantum){
							hh += works[i].bt;
							ct += hh;
							tat_R += ct;
							wt_R += ct - tem[i];
							temp = JSON.parse(JSON.stringify(works[i]));
							temp.bt = Number(temp.bt.toFixed(2));
							works[i].bt = 0
						} else{
							temp = JSON.parse(JSON.stringify(works[i]));
							temp.bt = quantum
							works[i].bt -= quantum
							hh += quantum;
						}
						rr.push(temp)
					}
				}
			}

			return rr
		}


		FFCS(ffcs)
		SJF(sjf)
		PRIORITY(priority)
		round_robin = ROUND_ROBIN(round_robin)
		if(n){
			wt_F /= n; tat_F /= n;
			wt_S /= n; tat_S /= n;
			wt_P /= n; tat_P /= n;
			wt_R /= n; tat_R /= n;
		}

		//////////////////////
		//////PRINTING////////
		//////////////////////

		// console.log(ffcs)
		// console.log(sjf)
		// console.log(priority)
		// console.log(round_robin)

		function getDate(currDate, bt, obj){

			var someDate = currDate

			obj.from.dd = someDate.getDate();
			obj.from.mm = someDate.getMonth() + 1;
			obj.from.yy = someDate.getFullYear();
			obj.from.hh = hours.toFixed(2)

			daysNeedToComplete = Math.floor((hours + bt)/workingHoursPerDay)
			hours = (hours + bt)%workingHoursPerDay

			if(hours == 0){ hours = workingHoursPerDay; daysNeedToComplete -=1; }
			someDate.setDate(someDate.getDate() + daysNeedToComplete); 

			obj.to.dd = someDate.getDate();
			obj.to.mm = someDate.getMonth() + 1;
			obj.to.yy = someDate.getFullYear();
			obj.to.hh = hours.toFixed(2);
			
			if(hours == workingHoursPerDay) { hours = 0; daysNeedToComplete += 1; 
			someDate.setDate(someDate.getDate() + daysNeedToComplete); }

			return someDate
		}


		for(i=0, hours = 0,date = new Date();i<n;i++){
			date = getDate(date, ffcs[i].bt, ffcs[i])
		}

		for(i=0, hours = 0,date = new Date();i<n;i++){
			date = getDate(date, sjf[i].bt, sjf[i])
		}

		for(i=0, hours = 0,date = new Date();i<n;i++){
			date = getDate(date, priority[i].bt, priority[i])
		}

		for(i=0, hours = 0,date = new Date();i<round_robin.length;i++){
			date = getDate(date, round_robin[i].bt, round_robin[i])
		}

		// console.log("FFCS", ffcs)
		// console.log("SJF", sjf)
		// console.log("PRIORITY", priority)
		// console.log("ROUND_ROBIN", round_robin)
		var answer = [ffcs, sjf, priority, round_robin, tat_F, wt_F, tat_S, wt_S, tat_P, wt_P, tat_R, wt_R]
		return answer;
	}
}