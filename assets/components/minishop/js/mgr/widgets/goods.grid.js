miniShop.grid.Goods = function(config) {
	config = config || {};
	Ext.applyIf(config,{
		id: 'minishop-grid-goods'
		,url: miniShop.config.connector_url
		,baseParams: {
			action: 'mgr/goods/getlist'
		}
		,save_action: 'mgr/goods/updatefromgrid'
		,autosave: true
		,autoHeight: true
		,paging: true
		,remoteSort: true
		,clicksToEdit: 'auto'
		//,preventSaveRefresh: false
		,fields: ['id','pagetitle','parent','wid','article','price','weight','img','remains','reserved','url']
		,columns: [
			{header: _('id'), dataIndex: 'id', sortable: true, width: 35}
			,{header: _('ms.warehouse'), dataIndex: 'wid', hidden: true}
			,{header: _('pagetitle'),dataIndex: 'pagetitle', sortable: true, width: 100}
			,{header: _('parent'),dataIndex: 'parent',hidden: true,sortable: true}
			,{header: _('ms.article'),dataIndex: 'article',sortable: true, width: 50}
			,{header: _('ms.price'),dataIndex: 'price',sortable: true, width: 50}
			,{header: _('ms.weight'),dataIndex: 'weight',sortable: true, width: 50}
			,{header: _('ms.img'),dataIndex: 'img',renderer: this.renderImg,sortable: true,width: 50}
			,{header: _('ms.remains'),dataIndex: 'remains',sortable: true, width: 50}
			,{header: _('ms.reserved'),dataIndex: 'reserved',sortable: true, width: 50}
		]
		,tbar: [{
			text: _('ms.goods.create')
			,handler: this.createGoods
			,scope: this
		},{
			xtype: 'tbspacer'
			,width: 30
		},
			'<strong>' + _('ms.warehouse') + ':</strong>&nbsp;'
		,{
			xtype: 'minishop-filter-warehouse'
			,id: 'goods-filter-warehouse'
			,listeners: {select: {fn: this.filterByWarehouse, scope:this}}
		},{
			xtype: 'tbspacer'
			,width: 10
		},
			'<strong>' + _('ms.category') + ':</strong>&nbsp;'
		,{
			xtype: 'minishop-filter-category'
			,id: 'goods-filter-category'
			,width: 200
			,listeners: {'select': {fn: this.filterByCategory, scope:this}}
		 },{
			xtype: 'tbfill'
		},{
			xtype: 'minishop-filter-byquery'
			,id: 'minishop-goods-filter-byquery'
			,listeners: {render: { fn: function(tf) {tf.getEl().addKeyListener(Ext.EventObject.ENTER, function() {this.FilterByQuery(tf);}, this);},scope: this}}
		},{
			xtype: 'minishop-filter-clear'
			,listeners: {click: {fn: this.FilterClear, scope: this}}
		}]
		,listeners: {
			rowDblClick: function(grid, rowIndex, e) {
				var row = grid.store.getAt(rowIndex);
				this.editGoods(grid, e, row);
			}
		}
	});
	miniShop.grid.Goods.superclass.constructor.call(this,config);
};
Ext.extend(miniShop.grid.Goods,MODx.grid.Grid,{
	windows: {}

	,FilterClear: function() {
		var s = this.getStore();
		s.baseParams.query = '';
		Ext.getCmp('minishop-goods-filter-byquery').reset();
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}
	,FilterByQuery: function(tf, nv, ov) {
		var s = this.getStore();
		s.baseParams.query = tf.getValue();
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}
	,filterByWarehouse: function(cb) {
		this.getStore().baseParams['warehouse'] = cb.value;
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}    
	,filterByCategory: function(cb) {
		this.getStore().baseParams['category'] = cb.value;
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}
	,renderImg: function(img) {
		if (img.length > 0) {
			if (/^(http|https)/.test(img)) {
				return '<img src="'+img+'" alt="" height="30" />'
				//return '<img src="'+MODx.config.connectors_url+'system/phpthumb.php?h=30&src='+img+'&wctx=web&source=1" alt="" />'
			}
			else {

				return '<img src="/'+img+'" alt="" height="30" />'
				//return '<img src="'+MODx.config.connectors_url+'system/phpthumb.php?h=30&src=/'+img+'&wctx=web&source=1" alt="" alt="" height="30" />'
			}
		}
		else {
			return '';
		}
	}

	,getMenu: function() {
		var m = [];
		m.push({
			text: _('ms.goods.change')
			,handler: this.editGoods
			,scope: this
		});
		m.push({
			text: _('ms.duplicate')
			,handler: this.duplicateGoods
		});
		m.push('-');
		m.push({
			text: _('ms.goods.goto_site_page')
			,handler: this.goToGoodsSitePage
		}); 
		m.push({
			text: _('ms.goods.goto_manager_page')
			,handler: this.goToGoodsManagerPage
		});
		m.push('-');     
		m.push({
			text: _('ms.goods.delete')
			,handler: this.deleteGoods
		});
		this.addContextMenuItem(m);
	}
	,goToGoodsSitePage: function() {
		var url = this.menu.record.url;
		window.open(url);
	}
	,goToGoodsManagerPage: function() {
		var id = this.menu.record.id;
		window.open('/manager/index.php?a=30&id=' + id);
	}
	,createGoods: function(e) {
		gid = 0;
		var w = MODx.load({
			xtype: 'minishop-window-creategoods'
			,title: _('ms.goods.create')
			,disable_categories: true
			,action: 'mgr/goods/create'
			,listeners: {
				'success':{fn:function() {
					Ext.getCmp('minishop-grid-goods').store.reload();
				},scope:this}
				//,'hide':{fn:function() {this.destroy();}}
				,'show':{fn:function() {this.center();}}
			}
		});
		w.show(e.target,function() {
			Ext.isSafari ? w.setPosition(null,30) : w.center();
		},this);
	}
	,editGoods: function(btn, e, row) {
		if (typeof(row) != 'undefined') {
			gid = row.data.id
			wid = row.data.wid
		}
		else {
			gid = this.menu.record.id
			wid = this.menu.record.wid
		}
		changed = 0;
		MODx.Ajax.request({
			url: miniShop.config.connector_url
			,params: {
				action: 'mgr/goods/get'
				,id: gid
				,wid: wid
			}
			,listeners: {
				'success': {fn:function(r) {
					var record = r.object;
					
					var w = MODx.load({
						xtype: 'minishop-window-creategoods'
						,title: record.pagetitle
						,record: record
						,disable_categories: false
						,activeTab: 1
						,action: 'mgr/goods/update'
						,listeners: {
							//success:{fn:function() {},scope:this}
							hide: {fn:function() {
								if (changed == 1) {
									Ext.getCmp('minishop-grid-goods').store.reload();
								}
								changed = 0;
							}}
						}
					});
					w.setValues(r.object);
					w.show(e.target,function() {
						Ext.isSafari ? w.setPosition(null,30) : w.center();
					},this);
				},scope:this}
			}
		});
	}
	,duplicateGoods: function(btn,e) {
		MODx.msg.confirm({
			title: _('ms.duplicate')
			,text: _('ms.duplicate_confirm')
			,url: this.config.url
			,params: {
				action: 'mgr/goods/duplicate'
				,id: this.menu.record.id
			}
			,listeners: {
				'success': {fn:function(r) {
					this.refresh();
				},scope:this}
			}
		});
	}
	,deleteGoods: function(btn,e) {
		if (!this.menu.record) return false;
		
		MODx.msg.confirm({
			title: _('ms.goods.delete')
			,text: _('ms.goods.delete_confirm')
			,url: this.config.url
			,params: {
				action: 'mgr/goods/delete'
				,id: this.menu.record.id
			}
			,listeners: {
				'success': {fn:function(r) {
					this.refresh();
				},scope:this}
			}
		});
	}
});
Ext.reg('minishop-grid-goods',miniShop.grid.Goods);


miniShop.window.createGoods = function(config) {
	config = config || {};

	this.ident = config.ident || 'qcr'+Ext.id();
	Ext.applyIf(config,{
		title: _('ms.goods.create')
		,id: this.ident
		,width: 700
		,modal: true
		,labelAlign: 'left'
		,labelWidth: 150
		,url: miniShop.config.connector_url
		,action: 'mgr/goods/create'
		,shadow: false
		,fields: [{
			xtype: 'modx-tabs'
			,activeTab: config.activeTab || 0
			,bodyStyle: { background: 'transparent' }
			,deferredRender: false
			,autoHeight: true
			,stateful: true
			,stateId: 'ms-tabs-goods'
			,stateEvents: ['tabchange']
			,getState:function() {
				return { activeTab:this.items.indexOf(this.getActiveTab()) };
			}
			,items: [{
				title: _('ms.goods')
				,layout: 'form'
				,cls: 'modx-panel'
				,bodyStyle: { background: 'transparent', padding: '10px' }
				,autoHeight: true
				,labelAlign: 'top'
				,labelWidth: 100
				,items: [{
					layout: 'column'
					,border: false
					,items: [{
						columnWidth: .6
						,border: false
						,layout: 'form'
						,items: [
							{xtype: 'textfield',name: 'pagetitle',id: 'modx-'+this.ident+'-pagetitle',fieldLabel: _('pagetitle'),anchor: '100%',allowBlank: false}
							,{xtype: 'textfield',name: 'longtitle',id: 'modx-'+this.ident+'-longtitle',fieldLabel: _('long_title'),anchor: '100%'}
							,{xtype: 'textarea',name: 'description',id: 'modx-'+this.ident+'-description',fieldLabel: _('description'),anchor: '100%',grow: false,height: 50}
							,{xtype: 'textarea',name: 'introtext',id: 'modx-'+this.ident+'-introtext',fieldLabel: _('introtext'),anchor: '100%',height: 50}
						]
					},{
						columnWidth: .4
						,border: false
						,layout: 'form'
						,items: [
							{xtype: 'minishop-combo-goodstemplate',id: 'modx-'+this.ident+'-template',fieldLabel: _('template'),editable: false,anchor: '100%',value: miniShop.config.ms_goods_tpls[0]}
							,{xtype: 'minishop-filter-category',name: 'parent',fieldLabel: _('ms.category'),baseParams: {action: 'mgr/goods/getcombo',addall: 0},anchor: '100%',hiddenName: 'parent'}
							,{xtype: 'textfield',name: 'alias',id: 'modx-'+this.ident+'-alias',fieldLabel: _('alias'),anchor: '100%'}
							,{xtype: 'textfield',name: 'menutitle',id: 'modx-'+this.ident+'-menutitle',fieldLabel: _('resource_menutitle'),anchor: '100%'}
							,{xtype: 'xcheckbox',name: 'published',id: 'modx-'+this.ident+'-published',boxLabel: _('resource_published'),description: _('resource_published_help'),inputValue: 1,checked: MODx.config.publish_default == '1' && config.disable_categories ? 1 : 0}
							,{xtype: 'xcheckbox',boxLabel: _('resource_hide_from_menus'),description: _('resource_hide_from_menus_help'),name: 'hidemenu',id: 'modx-'+this.ident+'-hidemenu',inputValue: 1,checked: MODx.config.hidemenu_default == '1' && config.disable_categories ? 1 : 0}
						]
					}]
				},{xtype: 'textarea',name: 'content',fieldLabel: _('content'),anchor: '100%',height: 100}
					,{xtype: 'hidden',name: 'class_key',value: 'modDocument'}
					,{xtype: 'hidden',name: 'context_key'}
					,{xtype: 'hidden',name: 'content_type' ,value: 1}
					,{xtype: 'hidden',name: 'content_dispo',value: 0}
					,{xtype: 'hidden',name: 'isfolder' ,value: 0}
					,{xtype: 'hidden',name: 'richtext' ,value: 1}
					,{xtype: 'hidden',name: 'searchable' ,value: 1}
					,{xtype: 'hidden',name: 'cacheable' ,value: 1}
					,{xtype: 'hidden',name: 'clearCache' ,value: 1}
			]
			},{
				id: 'modx-'+this.ident+'-properties'
				,title: _('ms.properties')
				,layout: 'form'
				,cls: 'modx-panel'
				,autoHeight: true
				,forceLayout: true
				,labelAlign: 'left'
				,labelWidth: 200
				,defaults: {autoHeight: true ,border: false}
				,style: 'background: transparent;'
				,bodyStyle: { background: 'transparent', padding: '10px' }
				,items: [
					{xtype: 'hidden',name: 'id'}
					,{xtype: 'hidden',name: 'wid'}
					,{xtype: 'textfield',name: 'article',fieldLabel: _('ms.article')}
					,{xtype: 'numberfield',name: 'price',fieldLabel: _('ms.price')}
					,{xtype: 'numberfield',name: 'weight',fieldLabel: _('ms.weight')}
					,{xtype: 'modx-combo-browser',name: 'img',fieldLabel: _('ms.img'),anchor: '100%'}
					,{xtype: 'numberfield',name: 'remains',fieldLabel: _('ms.remains')}
					,{xtype: 'displayfield',name: 'reserved',fieldLabel: _('ms.reserved')}
					,{xtype: 'textfield',name: 'add1',fieldLabel: _('ms.goods.add1'),anchor: '100%'}
					,{xtype: 'textfield',name: 'add2',fieldLabel: _('ms.goods.add2'),anchor: '100%'}
					,{xtype: 'textarea',name: 'add3',fieldLabel: _('ms.goods.add3'),autoHeight: false,anchor: '100%',height: 100}
					,{xtype: 'checkbox',name: 'duplicate',value: 1,style: 'padding: 10px;',fieldLabel: _('ms.goods.duplicate'),description: _('ms.goods.duplicate.desc')}
				]
			},{
				title: 'TVs'
				,items: [{
					xtype: 'minishop-grid-tvs'
					,disabled: config.disable_categories
					,baseParams: {
						action: 'mgr/goods/tv/getlist'
						,gid: gid
					}
				}]
			},{
				title: _('ms.categories')
				,items: [{
					xtype: 'minishop-grid-categories'
					,disabled: config.disable_categories
					,baseParams: {
						action: 'mgr/goods/getcatlist'
						,gid: gid
					}
				}]
			}]
		}]
	   ,keys: [{
			key: Ext.EventObject.ENTER
			,shift: true
			,fn:  function() {changed = 1; this.submit() }
			,scope: this
		}]
		,buttons: [{
			text: config.cancelBtnText || _('cancel')
			,scope: this
			,handler: function() {this.hide(); }
		},{
			text: config.saveBtnText || _('save_and_close')
			,scope: this
			,handler: function() {changed = 1; this.submit() }
		}]
	});
	miniShop.window.createGoods.superclass.constructor.call(this,config);
};
Ext.extend(miniShop.window.createGoods,MODx.Window);
Ext.reg('minishop-window-creategoods',miniShop.window.createGoods);


miniShop.grid.Categories = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		id: this.ident+'-grid-categories'
		,url: miniShop.config.connector_url
		,baseParams: {action: 'mgr/goods/getcatlist'}
		,autosave: true
		,save_action: 'mgr/goods/updatefromgrid'
		,fields: ['id','gid','pagetitle','enabled']
		,pageSize: 10
		,autoHeight: true
		,paging: true
		,remoteSort: true
		,columns: [
			{header: _('ms.cid'),dataIndex: 'id',hidden: true}
			,{header: _('ms.gid'),dataIndex: 'gid',hidden: true}
			,{header: _('ms.name'),dataIndex: 'pagetitle',width: 100,sortable: true}
			,{header: _('ms.enabled'),dataIndex: 'enabled',width: 60,editor: { xtype: 'combo-boolean', renderer: 'boolean' }}
		]
		,tbar: [{
			xtype: 'tbfill'
		},{
			xtype: 'minishop-filter-byquery'
			,id: Ext.id() + '-filter-byquery'
			,width: 150
			,emptyText: _('ms.search')
			,listeners: {
				render: { fn: function(tf) {tf.getEl().addKeyListener(Ext.EventObject.ENTER, function() {this.FilterByQuery(tf);}, this);},scope: this}
			}
		}]
	});
	miniShop.grid.Categories.superclass.constructor.call(this,config);
};
Ext.extend(miniShop.grid.Categories,MODx.grid.Grid, {
	FilterByQuery: function(tf, nv, ov) {
		var s = this.getStore();
		s.baseParams.query = tf.getValue();
		this.getBottomToolbar().changePage(1);
		this.refresh();
	}
});
Ext.reg('minishop-grid-categories',miniShop.grid.Categories);

miniShop.grid.TVs = function(config) {
	config = config || {};

	Ext.applyIf(config,{
		id: this.ident+'-grid-tvs'
		,url: miniShop.config.connector_url
		,action: 'mgr/goods/tv/getlist'
		,fields: ['id','resourceId','name','caption','value','input_properties','type']
		,pageSize: 10
		,autoHeight: true
		,paging: true
		,remoteSort: true
		,columns: [
			{header: _('id'),dataIndex: 'id',hidden: true,sortable: true}
			,{header: _('name'),dataIndex: 'name',sortable: true,width: 50}
			,{header: _('caption'),dataIndex: 'caption',sortable: true,width: 100}
			,{header: _('value'),dataIndex: 'value',sortable: true,width: 150}
		]
		,listeners: {
			rowDblClick: function(grid, rowIndex, e) {
				var row = grid.store.getAt(rowIndex);
				this.updateTV(grid, e, row);
			}
		}
	});
	miniShop.grid.TVs.superclass.constructor.call(this,config);
};
Ext.extend(miniShop.grid.TVs,MODx.grid.Grid, {
	windows: {}
	,getMenu: function() {
		var m = [];
		m.push({
			text: _('ms.tv.update')
			,handler: this.updateGoods
		});
		//m.push('-');
		this.addContextMenuItem(m);
	}
	,updateTV: function(btn,e,row) {
		if (typeof(row) != 'undefined') {
			var record = row.data;
		}
		else {
			var record = this.menu.record;
		}
		this.windows.updateTV = MODx.load({
			xtype: 'minishop-window-goods-tv'
			,props: record
			,title: record.name
			,listeners: {
				'success': {fn:function() { this.refresh(); },scope:this}
				,'hide': {fn:function() { this.destroy(); }}
			}
		});
		this.windows.updateTV.fp.getForm().reset();

		var vf = {fieldLabel: _('value'),name: 'value',id: 'minishop-'+this.ident+'-value', anchor: '95%'};
		var def = 0;
		switch (record.type) {
			case 'number': vf.xtype = 'numberfield'; break;
			case 'text': vf.xtype = 'textfield'; break;
			case 'image': vf.xtype = 'modx-combo-browser'; break;
			case 'file': vf.xtype = 'modx-combo-browser'; break;
			case 'date': vf.xtype = 'xdatetime'; break;
			case 'text': vf.xtype = 'textarea'; break;
			case 'checkbox': vf.xtype = 'textfield'; break;
			case 'option': vf.xtype = 'textfield'; break;
			case 'richtext': vf.xtype = 'htmleditor'; vf.height = 100; break;
			case 'textarea': vf.xtype = 'textarea'; vf.height = 100; break;
			default: vf.xtype = 'textarea'; vf.height = 75; var def = 1;
		}
		if (def != 1) {
			Ext.applyIf(vf,record.input_properties);
		}

		this.windows.updateTV.fp.add(vf);
		this.windows.updateTV.fp.getForm().setValues(record);
		this.windows.updateTV.show(e.target);
	}

});
Ext.reg('minishop-grid-tvs',miniShop.grid.TVs);



miniShop.window.updateTV = function(config) {
	config = config || {};
	this.ident = config.ident || 'mecitem'+Ext.id();

	Ext.applyIf(config,{
		title: _('ms.orderedgoods.add')
		,id: this.ident
		,width: 600
		,url: miniShop.config.connector_url
		,action: 'mgr/goods/tv/update'
		,labelAlign: 'left'
		,labelWidth: 150
		,height: 150
		,autoHeight: true
		,fields: [
			{xtype: 'hidden',name: 'id',id: 'minishop-'+this.ident+'-id'}
			,{xtype: 'hidden',name: 'resourceId',id: 'minishop-'+this.ident+'-resourceId'}
			,{xtype: 'displayfield',fieldLabel: _('type'),name: 'type',id: 'minishop-'+this.ident+'-type'}
			,{xtype: 'displayfield',fieldLabel: _('name'),name: 'name',id: 'minishop-'+this.ident+'-name'}
			,{xtype: 'displayfield',fieldLabel: _('caption'),name: 'caption',id: 'minishop-'+this.ident+'-caption'}
		]
		,keys: [{
			key: Ext.EventObject.ENTER
			,shift: true
			,fn: this.submit
			,scope: this
		}]
		,buttons: [{
			text: _('close')
			,scope: this
			,handler: function() { this.hide();}
		},{
			text: _('save_and_close')
			,scope: this
			,handler: function() { this.submit();}
		}]
	});
	miniShop.window.updateTV.superclass.constructor.call(this,config);
};
Ext.extend(miniShop.window.updateTV,MODx.Window);
Ext.reg('minishop-window-goods-tv',miniShop.window.updateTV);
