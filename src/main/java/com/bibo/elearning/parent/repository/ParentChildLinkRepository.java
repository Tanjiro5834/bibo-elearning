package com.bibo.elearning.parent.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.bibo.elearning.auth.user.entity.User;
import com.bibo.elearning.parent.entity.ParentChildLink;

@Repository
public interface ParentChildLinkRepository extends JpaRepository<ParentChildLink, Long> {

    List<ParentChildLink> findAllByParent(User parent);

    Optional<ParentChildLink> findByParentAndChild(User parent, User child);

    boolean existsByParentAndChild(User parent, User child);
}
