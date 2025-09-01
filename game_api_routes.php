<?php
Route::prefix('api/game/v1')->group(function () {
    // 游戏配置API
    Route::apiResource('config', 'App\Http\Controllers\Game\Api\V1\GameConfigController');
    
    // 游戏数据分析API
    Route::prefix('analytics')->group(function () {
        Route::get('dashboard', 'App\Http\Controllers\Game\Api\V1\GameAnalyticsController@dashboard');
        Route::get('players', 'App\Http\Controllers\Game\Api\V1\GameAnalyticsController@players');
        Route::get('players/{id}/sessions', 'App\Http\Controllers\Game\Api\V1\GameAnalyticsController@playerSessions');
        Route::get('sessions', 'App\Http\Controllers\Game\Api\V1\GameAnalyticsController@sessions');
        Route::get('performance', 'App\Http\Controllers\Game\Api\V1\GameAnalyticsController@performance');
    });
    
    // 游戏活动API
    Route::apiResource('activity', 'App\Http\Controllers\Game\Api\V1\GameActivityController');
    Route::post('activity/{id}/toggle-status', 'App\Http\Controllers\Game\Api\V1\GameActivityController@toggleStatus');
    Route::get('activity/{id}/participants', 'App\Http\Controllers\Game\Api\V1\GameActivityController@participants');
    Route::get('activity/{id}/statistics', 'App\Http\Controllers\Game\Api\V1\GameActivityController@statistics');
    Route::get('activity/{id}/export', 'App\Http\Controllers\Game\Api\V1\GameActivityController@export');
});