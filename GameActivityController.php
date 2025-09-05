<?php

namespace App\Http\Controllers\Game\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GameActivityController extends Controller
{
    /**
     * 获取游戏活动列表
     */
    public function index(Request $request)
    {
        try {
            $query = DB::table('game_activities');
            
            // 搜索功能
            if ($request->has('search') && $request->search) {
                $query->where('name', 'like', '%' . $request->search . '%')
                      ->orWhere('description', 'like', '%' . $request->search . '%');
            }
            
            // 状态筛选
            if ($request->has('status') && $request->status !== '') {
                $query->where('status', $request->status);
            }
            
            // 类型筛选
            if ($request->has('type') && $request->type) {
                $query->where('type', $request->type);
            }
            
            // 排序
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $activities = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $activities
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 创建游戏活动
     */
    public function store(Request $request)
    {
        try {
            $data = $request->only([
                'name', 'type', 'description', 'start_time', 'end_time', 'config', 'status'
            ]);
            
            $data['created_at'] = now();
            $data['updated_at'] = now();
            
            $activityId = DB::table('game_activities')->insertGetId($data);
            
            return response()->json([
                'code' => 200,
                'message' => '创建成功',
                'data' => ['id' => $activityId]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '创建失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 更新游戏活动
     */
    public function update(Request $request, $id)
    {
        try {
            $data = $request->only([
                'name', 'type', 'description', 'start_time', 'end_time', 'config', 'status'
            ]);
            
            $data['updated_at'] = now();
            
            $affected = DB::table('game_activities')
                         ->where('id', $id)
                         ->update($data);
            
            if ($affected === 0) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '更新成功'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '更新失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 删除游戏活动
     */
    public function destroy($id)
    {
        try {
            // 先删除相关的参与者记录
            DB::table('activity_participants')
              ->where('activity_id', $id)
              ->delete();
            
            // 删除活动
            $affected = DB::table('game_activities')
                         ->where('id', $id)
                         ->delete();
            
            if ($affected === 0) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            return response()->json([
                'code' => 200,
                'message' => '删除成功'
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '删除失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 切换活动状态
     */
    public function toggleStatus(Request $request, $id)
    {
        try {
            $activity = DB::table('game_activities')
                         ->where('id', $id)
                         ->first();
            
            if (!$activity) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            $newStatus = $activity->status == 1 ? 0 : 1;
            
            DB::table('game_activities')
              ->where('id', $id)
              ->update([
                  'status' => $newStatus,
                  'updated_at' => now()
              ]);
            
            return response()->json([
                'code' => 200,
                'message' => '状态更新成功',
                'data' => ['status' => $newStatus]
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '状态更新失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取活动参与者列表
     */
    public function participants(Request $request, $id)
    {
        try {
            $activity = DB::table('game_activities')
                         ->where('id', $id)
                         ->first();
            
            if (!$activity) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            $query = DB::table('activity_participants')
                      ->join('game_players', 'activity_participants.player_id', '=', 'game_players.id')
                      ->where('activity_participants.activity_id', $id)
                      ->select(
                          'activity_participants.*',
                          'game_players.nickname',
                          'game_players.avatar',
                          'game_players.openid'
                      );
            
            // 排序
            $sortBy = $request->get('sort_by', 'rank');
            $sortOrder = $request->get('sort_order', 'asc');
            $query->orderBy($sortBy, $sortOrder);
            
            // 分页
            $perPage = $request->get('per_page', 15);
            $participants = $query->paginate($perPage);
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => $participants
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '获取失败：' . $e->getMessage()
            ]);
        }
    }
    
    /**
     * 获取活动统计信息
     */
    public function statistics($id)
    {
        try {
            $activity = DB::table('game_activities')
                         ->where('id', $id)
                         ->first();
            
            if (!$activity) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            // 参与人数统计
            $participantCount = DB::table('activity_participants')
                                 ->where('activity_id', $id)
                                 ->count();
            
            // 最高分统计
            $maxScore = DB::table('activity_participants')
                         ->where('activity_id', $id)
                         ->max('score') ?: 0;
            
            // 平均分统计
            $avgScore = DB::table('activity_participants')
                         ->where('activity_id', $id)
                         ->avg('score') ?: 0;
            
            return response()->json([
                'code' => 200,
                'message' => '获取成功',
                'data' => [
                    'participant_count' => $participantCount,
                    'max_score' => $maxScore,
                    'avg_score' => round($avgScore, 2)
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
     * 导出活动数据
     */
    public function export($id)
    {
        try {
            $activity = DB::table('game_activities')
                         ->where('id', $id)
                         ->first();
            
            if (!$activity) {
                return response()->json([
                    'code' => 404,
                    'message' => '活动不存在'
                ]);
            }
            
            $participants = DB::table('activity_participants')
                             ->join('game_players', 'activity_participants.player_id', '=', 'game_players.id')
                             ->where('activity_participants.activity_id', $id)
                             ->select(
                                 'game_players.nickname',
                                 'game_players.openid',
                                 'activity_participants.score',
                                 'activity_participants.rank',
                                 'activity_participants.participated_at'
                             )
                             ->orderBy('activity_participants.rank', 'asc')
                             ->get();
            
            return response()->json([
                'code' => 200,
                'message' => '导出成功',
                'data' => $participants
            ]);
            
        } catch (\Exception $e) {
            return response()->json([
                'code' => 500,
                'message' => '导出失败：' . $e->getMessage()
            ]);
        }
    }
}