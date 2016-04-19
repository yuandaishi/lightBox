;(function($){
	var LightBox=function(settings){
		var _this=this;//因为this指向会随着执行环境的不同而改变，所以需要把当前对象保存
		this.settings={//默认配置
			mask:"slideInDown",//遮罩弹出动画
			maskMove:"fadeOutDown",//遮罩消失动画
			animated:"zoomIn",//弹窗动画
			animatedMove:"zoomOut",//弹窗消失动画
			duration:".8s",//弹窗动画时间
			preNxtAnimated:"fadeOut",//前后箭头消失动画
			preNxtAnimatedApp:"fadeIn",//前后箭头出现动画
			imgAnimated:"flipInX"//图片加载动画	
		};
		$.extend(this.settings,settings||{});
		this.bodyName=$(document.body);
		this.lightbox_mask=$('<div class="lightbox_mask animated '+this.settings.mask+'"></div>');
		this.lightbox_contain=$('<div class="lightbox_contain animated '+this.settings.animated+'" style="animation-duration:'+this.settings.duration+';-webkit-animation-duration:'+this.settings.duration+';"></div>');
		//创建遮罩和弹出层
		this.lightboxGroup=null;
		this.lightboxGroupArr=[];
		this.con=false;
		$("body").on("click","[data-rose=lightbox]",function(e){
			e.stopPropagation();
			_this.currentlightboxGroup=$(this).attr("data-group");
			if(_this.currentlightboxGroup!==_this.lightboxGroup){//此处不应该用this.lightboxGroup。this指向我们点击的元素，而我们点击的元素没有lightboxGroup这个属性
				//console.log("eheheh");
				_this.lightboxGroupArr.length=0;
				_this.createGroupMessage();	
				_this.lightboxGroup=_this.currentlightboxGroup;
			}
			k=$("[data-group="+_this.currentlightboxGroup+"]").index($(this));//全局变量
			_this.renderMask();
			_this.renderDom(k);
			_this.loadImg(k);
		})
		$("body").on("click",".lightbox_close_btn",function(){
			_this.closeLightboxContain();
		})
		$("body").on("click",".lightbox_next",function(){
			_this.nextPic(k);
			k+=1;//加载下一张之后，K值+1
		})
		$("body").on("click",".lightbox_pre",function(){
			_this.prePic(k);
			k-=1;//加载下一张之后，K值+1
		})
	};
	LightBox.prototype={
		//插入遮罩层
		renderMask:function(){
			this.bodyName.append(this.lightbox_mask);
		},
		//加载图片
		loadImg:function(k){
			var _this=this;
			var imgUrl=_this.lightboxGroupArr[k]["data-source"];
			var strImg='<img src="'+imgUrl+'" class="lightbox_img animated '+_this.settings.imgAnimated+'" />';
			var img=new Image();
			img.src=imgUrl;
			img.onload=function(){//图片加载成功之后，执行下面的代码，如果加载不成功，则不执行
				//判断是否已经存在一张图片，目的用于上一张和下一张的替换，如果存在的话，先移除存在的图片
				var imgExist=$("img.lightbox_img")[0];//判断dom元素，不能判断JQ元素，因为JQ元素定义了就会存在
				if(imgExist!==undefined){
					imgExist.remove();
				}
				$(".lightbox_content").append(strImg);//必须放在前面，不然W和H不能正确取值
				var w=$("img.lightbox_img").width();
				var h=$("img.lightbox_img").height();
				_this.lightBoxWH(w,h);
			}
		},
		//插入弹窗
		renderDom:function(k){
			var _this=this;
			var l=k+1;
			var strDom='<div class="lightbox_content">'+
				'<span class="lightbox_btn lightbox_pre animated"></span>'+
				'<span class="lightbox_btn lightbox_next animated"></span>'+
				'</div>'+
				'<div class="lightbox_pic_contain">'+
				'<div class="light_box_test">'+
				'<p class="lightbox_title">'+_this.lightboxGroupArr[k]["data-prompt"]+'</p>'+
				'<span class="lightbox_list">当前索引：'+l+' of '+_this.lightboxGroupArr.length+'</span>'+
				'</div>'+
				'<span class="lightbox_close_btn"></span>'+
				'</div>';
			//插入dom
			this.lightbox_contain.html(strDom);
			this.bodyName.append(this.lightbox_contain);
			_this.preNextExist(k);
			$(".lightbox_pre,.lightbox_next").addClass(this.settings.preNxtAnimated);
			$(".lightbox_pre,.lightbox_next").css({
				"animation-delay":this.settings.duration,
				"-webkit-animation-delay":this.settings.duration
			})
			$(".lightbox_btn").hover(function(){
				$(this).css({
					"animation-delay":"0s",
					"-webkit-animation-delay":"0s"
				})
				$(this).removeClass(_this.settings.preNxtAnimated);
			},function(){
				$(this).removeClass(_this.settings.preNxtAnimatedApp).addClass(_this.settings.preNxtAnimated);
			})
		},
		
		//给弹窗定义宽高。其实可以直接在定义this.lightbox_contain的时候加上去，但是可读性太低，所以额外写出来
		lightBoxWH:function(w,h){
			this.lightbox_contain.css({//宽高不用设置，图片会撑开包裹他的div
				"marginTop":"-"+(h/2+"px"),
				"marginLeft":"-"+(w/2+"px")
			})
		},
		//创建组数据
		createGroupMessage:function(){
			var groupMessage=this.bodyName.find($("[data-group="+this.currentlightboxGroup+"]"));
			var _this=this;//此处为什么还需要定义。外面不是定义了吗。对此表示疑惑
			groupMessage.each(function(){
				_this.lightboxGroupArr.push({
					"data-source":$(this).attr("data-source"),
					"data-id":$(this).attr("data-id"),
					"data-prompt":$(this).attr("data-prompt")
				});
			})
		},
		//关闭弹窗
		closeLightboxContain:function(){
			var _this=this;
			$(".lightbox_mask").removeClass(this.settings.mask).addClass(this.settings.maskMove).delay(1100).queue(function(){//延迟执行
				$(this).remove();
			});
			$(".lightbox_contain").removeClass(this.settings.animated).addClass(this.settings.animatedMove).delay(1100).queue(function(){
				$(this).remove();
			});
			this.lightbox_mask=$('<div class="lightbox_mask animated '+this.settings.mask+'"></div>');//这里需要重新定义，具体原因目前不知道，
			this.lightbox_contain=$('<div class="lightbox_contain animated '+this.settings.animated+'" style="animation-duration:'+this.settings.duration+';-webkit-animation-duration:'+this.settings.duration+';"></div>');
		},
		//判断上下箭头是否显示
		preNextExist:function(k){
			var _this=this;
			if(_this.lightboxGroupArr.length==1){//只有一张图片的时候
				$(".lightbox_pre").hide();
				$(".lightbox_next").hide();	
			}else if(k==0){
				$(".lightbox_pre").hide();
				$(".lightbox_next").show();	
			}else if(k==_this.lightboxGroupArr.length-1){
				$(".lightbox_next").hide();	
				$(".lightbox_pre").show();
			}else{
				$(".lightbox_pre").show();
				$(".lightbox_next").show();	
			}
		},
		//下一张
		nextPic:function(k){
			var _this=this;
			var L=k+1;
			var m=k+2
			_this.loadImg(L);
			$(".lightbox_title").html(_this.lightboxGroupArr[L]["data-prompt"]);
			$(".lightbox_list").html('当前索引：'+m+' of '+_this.lightboxGroupArr.length);
			_this.preNextExist(L);
		},
		//上一张
		prePic:function(k){
			var _this=this;
			var L=k-1;
			_this.loadImg(L);
			$(".lightbox_title").html(_this.lightboxGroupArr[L]["data-prompt"]);
			$(".lightbox_list").html('当前索引：'+k+' of '+_this.lightboxGroupArr.length);
			_this.preNextExist(L);
		}
	}
	window['LightBox']=LightBox;//全局注册，因为LightBox是封装在函数内部的，所以外部其实是访问不到的
})(jQuery)
