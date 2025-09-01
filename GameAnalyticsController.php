<?php

namespace App\Http\Controllers\Game\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameAnalyticsController extends Controller
{
    /**
     * 获取游戏数据仪表板
     */
    public function dashboard(Request $request)
    {
        try {
            // 获取总玩家数
            $totalPlayers = DB::table('game_players')->count();
            
            // 获取总游戏次数
            $totalSessions = DB::table('game_sessions')->count();
            
            // 获取平均分数
            $avgScore = DB::table('game_sessions')->avg('score') ?: 0;
            
            // 获取平均游戏时长
            $avgDuration = DB::table('game_sessions')->avg('duration') ?: 0;
            
            // 获取近7天的每日统计
            $dailyStats = DB::table('game_sessions')
                           ->select(DB::raw('DATE(created_at) as date'), 
                                   DB::raw('count(*) as sessions'),
                                   DB::raw('count(distinct player_id) as players'))
                           ->where('created_at', '>=', now()->subDays(7))
                           ->groupBy(DB::raw('DATE(created_at)'))
                           ->orderBy('date', 'desc')
                           ->get();
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => [
                    'totalPlayers' => $totalPlayers,
                    'totalSessions' => $totalSessions,
                    'avgScore' => round($avgScore, 2),
                    'avgDuration' => round($avgDuration, 2),
                    'dailyStats' => $dailyStats
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }