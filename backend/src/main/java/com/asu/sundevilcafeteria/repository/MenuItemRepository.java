package com.asu.sundevilcafeteria.repository;

import com.asu.sundevilcafeteria.model.MealCategory;
import com.asu.sundevilcafeteria.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    
    List<MenuItem> findByCategory(MealCategory category);
    
    List<MenuItem> findByAvailableTrue();
    
    List<MenuItem> findByCategoryAndAvailableTrue(MealCategory category);
    
    List<MenuItem> findByNameContainingIgnoreCase(String name);
} 