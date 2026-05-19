package com.bibo.elearning.parent.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.entity.EncouragementMessage;
import java.util.List;

@Repository
public interface EncouragementMessageRepository extends JpaRepository<EncouragementMessage, Long> {

    List<EncouragementMessage> findAllByChild(User child);

    List<EncouragementMessage> findAllByParent(User parent);

    List<EncouragementMessage> findAllByChildAndIsRead(User child, Boolean isRead);
}
