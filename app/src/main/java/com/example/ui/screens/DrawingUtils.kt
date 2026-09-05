package com.example.ui.screens

import androidx.compose.ui.graphics.Color
import org.json.JSONArray
import org.json.JSONObject

data class CanvasPoint(val x: Float, val y: Float)

data class DrawStroke(
    val points: List<CanvasPoint>,
    val colorHex: String,
    val strokeWidth: Float
)

object DrawingSerializer {
    fun serialize(strokes: List<DrawStroke>, canvasWidth: Float, canvasHeight: Float): String {
        val root = JSONObject()
        root.put("w", canvasWidth.toDouble())
        root.put("h", canvasHeight.toDouble())
        val strokesArray = JSONArray()
        for (stroke in strokes) {
            val sObj = JSONObject()
            sObj.put("c", stroke.colorHex)
            sObj.put("w", stroke.strokeWidth.toDouble())
            val ptsArray = JSONArray()
            for (p in stroke.points) {
                val ptObj = JSONArray()
                ptObj.put(p.x.toDouble())
                ptObj.put(p.y.toDouble())
                ptsArray.put(ptObj)
            }
            sObj.put("p", ptsArray)
            strokesArray.put(sObj)
        }
        root.put("strokes", strokesArray)
        return root.toString()
    }

    fun deserialize(data: String): Pair<List<DrawStroke>, Pair<Float, Float>> {
        if (data.isBlank()) return Pair(emptyList(), Pair(1f, 1f))
        return try {
            val root = JSONObject(data)
            val w = root.optDouble("w", 1.0).toFloat().coerceAtLeast(1f)
            val h = root.optDouble("h", 1.0).toFloat().coerceAtLeast(1f)
            val strokesArray = root.optJSONArray("strokes") ?: JSONArray()
            val result = mutableListOf<DrawStroke>()
            for (i in 0 until strokesArray.length()) {
                val sObj = strokesArray.getJSONObject(i)
                val c = sObj.optString("c", "#FFFFFF")
                val sw = sObj.optDouble("w", 6.0).toFloat()
                val ptsArray = sObj.optJSONArray("p") ?: JSONArray()
                val pts = mutableListOf<CanvasPoint>()
                for (j in 0 until ptsArray.length()) {
                    val ptArr = ptsArray.getJSONArray(j)
                    pts.add(CanvasPoint(ptArr.getDouble(0).toFloat(), ptArr.getDouble(1).toFloat()))
                }
                if (pts.isNotEmpty()) {
                    result.add(DrawStroke(pts, c, sw))
                }
            }
            Pair(result, Pair(w, h))
        } catch (e: Exception) {
            Pair(emptyList(), Pair(1f, 1f))
        }
    }

    fun parseColor(hex: String, default: Color = Color.White): Color {
        return try {
            val clean = hex.removePrefix("#")
            val colorInt = when (clean.length) {
                6 -> (0xFF000000 or clean.toLong(16)).toInt()
                8 -> clean.toLong(16).toInt()
                else -> return default
            }
            Color(colorInt)
        } catch (e: Exception) {
            default
        }
    }
}
