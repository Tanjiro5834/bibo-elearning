package com.bibo.elearning.stats.dto.response;

import java.util.List;

public record LeaderboardResponse(List<Entry> entries, Integer myRank, int myXp, int totalStudents) {
    public record Entry(int rank, String displayName, String initials, int xp, boolean me) {}
}