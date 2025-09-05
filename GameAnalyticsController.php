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
    
    /**
     * 获取玩家列表
     */
    public function players(Request $request)
    {
        try {
            $query = DB::table('game_players');
            
            // 搜索功能
            if ($request->has('search') && $request->search) {
                $query->where('nickname', 'like', '%' . $request->search . '%')
                      ->orWhere('openid', 'like', '%' . $request->search . '%');
            }
            
            // 排序
            $sortBy = $request->get('sort_by', 'id');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $players = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $players
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取玩家游戏会话记录
     */
    public function playerSessions(Request $request, $playerId)
    {
        try {
            $query = DB::table('game_sessions')
                      ->where('player_id', $playerId);
            
            // 排序
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $sessions = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $sessions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取所有游戏会话记录
     */
    public function sessions(Request $request)
    {
        try {
            $query = DB::table('game_sessions')
                      ->join('game_players', 'game_sessions.player_id', '=', 'game_players.id')
                      ->select(
                          'game_sessions.*',
                          'game_players.nickname as player_nickname',
                          'game_players.openid as player_openid'
                      );
            
            // 搜索功能
            if ($request->has('search') && $request->search) {
                $query->where('game_players.nickname', 'like', '%' . $request->search . '%')
                      ->orWhere('game_players.openid', 'like', '%' . $request->search . '%');
            }
            
            // 关卡筛选
            if ($request->has('level') && $request->level) {
                $query->where('game_sessions.level', $request->level);
            }
            
            // 状态筛选
            if ($request->has('status') && $request->status !== '') {
                $query->where('game_sessions.status', $request->status);
            }
            
            // 排序
            $sortBy = $request->get('sort_by', 'game_sessions.created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $sessions = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $sessions
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取性能统计数据
     */
    public function performance(Request $request)
    {
        try {
            // 获取各关卡通过率
            $levelCompletion = DB::table('game_sessions')
                                ->select(
                                    'level',
                                    DB::raw('count(*) as total_attempts'),
                                    DB::raw('sum(case when status = 2 then 1 else 0 end) as completed'),
                                    DB::raw('round(sum(case when status = 2 then 1 else 0 end) / count(*) * 100, 2) as completion_rate')
                                )
                                ->groupBy('level')
                                ->orderBy('level')
                                ->get();
            
            // 获取平均游戏时长分布
            $durationDistribution = DB::table('game_sessions')
                                     ->select(
                                         DB::raw('case 
                                             when duration < 60 then "0-1分钟"
                                             when duration < 180 then "1-3分钟"
                                             when duration < 300 then "3-5分钟"
                                             else "5分钟以上"
                                         end as duration_range'),
                                         DB::raw('count(*) as count')
                                     )
                                     ->groupBy(DB::raw('case 
                                         when duration < 60 then "0-1分钟"
                                         when duration < 180 then "1-3分钟"
                                         when duration < 300 then "3-5分钟"
                                         else "5分钟以上"
                                     end'))
                                     ->get();
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => [
                    'level_completion' => $levelCompletion,
                    'duration_distribution' => $durationDistribution
                ]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
}