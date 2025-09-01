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
            
            $activities = $query->orderBy('created_at', 'desc')
                               ->paginate($request->get('per_page', 15));
            
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