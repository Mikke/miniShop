<?php
/**
 * miniShop
 *
 * Copyright 2010 by Shaun McCormick <shaun+minishop@modx.com>
 *
 * miniShop is free software; you can redistribute it and/or modify it under the
 * terms of the GNU General Public License as published by the Free Software
 * Foundation; either version 2 of the License, or (at your option) any later
 * version.
 *
 * miniShop is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along with
 * miniShop; if not, write to the Free Software Foundation, Inc., 59 Temple
 * Place, Suite 330, Boston, MA 02111-1307 USA
 *
 * @package minishop
 */
/**
 * Get a list of Payments
 *
 * @package minishop
 * @subpackage processors
 */
if (!$modx->hasPermission('view')) {return $modx->error->failure($modx->lexicon('ms.no_permission'));}
 
$isLimit = !empty($_REQUEST['limit']);
$start = $modx->getOption('start',$_REQUEST,0);
$limit = $modx->getOption('limit',$_REQUEST,20);
$sort = $modx->getOption('sort',$_REQUEST,'id');
$dir = $modx->getOption('dir',$_REQUEST,'ASC');
$query = $modx->getOption('query',$_REQUEST, 0);

$c = $modx->newQuery('ModPayment');
if (!empty($query)) {
	$c->orCondition(array(
		'name:LIKE' => '%'.$query.'%'
		,'description:LIKE' => '%'.$query.'%'
		,'snippet:LIKE' => '%'.$query.'%'
	));
}

$count = $modx->getCount('ModPayment',$c);

$c->sortby($sort,$dir);
if ($isLimit) $c->limit($limit, $start);
$warehouses = $modx->getCollection('ModPayment',$c);

$arr = array();
foreach ($warehouses as $v) {
	$tmp = $v->toArray();
	if ($res = $modx->getObject('modSnippet', $tmp['snippet'])) {
		$tmp['snippet'] = $res->get('name');
	}
	else {
		$tmp['snippet'] = '';
	}
	$arr[]= $tmp;
}
return $this->outputArray($arr, $count);