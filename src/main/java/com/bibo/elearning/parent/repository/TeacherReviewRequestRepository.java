package com.bibo.elearning.parent.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.entity.TeacherReviewRequest;
import java.util.List;

@Repository
public interface TeacherReviewRequestRepository extends JpaRepository<TeacherReviewRequest, Long> {

    List<TeacherReviewRequest> findAllByParent(User parent);

    List<TeacherReviewRequest> findAllByChild(User child);
}