package com.asu.sundevilcafeteria.service;

import com.asu.sundevilcafeteria.dto.MenuItemDto;
import com.asu.sundevilcafeteria.model.MealCategory;
import com.asu.sundevilcafeteria.model.MenuItem;
import com.asu.sundevilcafeteria.repository.MenuItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class MenuItemService {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private CloudStorageService cloudStorageService;
    
    public List<MenuItem> getAllMenuItems() {
        return menuItemRepository.findAll();
    }
    
    public List<MenuItem> getAvailableMenuItems() {
        return menuItemRepository.findByAvailableTrue();
    }
    
    public List<MenuItem> getMenuItemsByCategory(MealCategory category) {
        return menuItemRepository.findByCategoryAndAvailableTrue(category);
    }
    
    public MenuItem getMenuItemById(Long id) {
        return menuItemRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Menu item not found"));
    }
    
    public MenuItem createMenuItem(MenuItemDto menuItemDto) {
        MenuItem menuItem = new MenuItem();
        menuItem.setName(menuItemDto.getName());
        menuItem.setDescription(menuItemDto.getDescription());
        menuItem.setPrice(menuItemDto.getPrice());
        menuItem.setCategory(menuItemDto.getCategory());
        menuItem.setAvailable(menuItemDto.getAvailable());
        menuItem.setImageUrl(menuItemDto.getImageUrl());
        
        return menuItemRepository.save(menuItem);
    }
    
    public MenuItem updateMenuItem(Long id, MenuItemDto menuItemDto) {
        MenuItem menuItem = getMenuItemById(id);
        
        menuItem.setName(menuItemDto.getName());
        menuItem.setDescription(menuItemDto.getDescription());
        menuItem.setPrice(menuItemDto.getPrice());
        menuItem.setCategory(menuItemDto.getCategory());
        menuItem.setAvailable(menuItemDto.getAvailable());
        menuItem.setImageUrl(menuItemDto.getImageUrl());
        
        return menuItemRepository.save(menuItem);
    }
    
    public void deleteMenuItem(Long id) {
        MenuItem menuItem = getMenuItemById(id);
        
        // Delete associated image from Cloud Storage if it exists
        if (menuItem.getImageUrl() != null) {
            cloudStorageService.deleteImage(menuItem.getImageUrl());
        }
        
        menuItemRepository.delete(menuItem);
    }
    
    public void toggleAvailability(Long id) {
        MenuItem menuItem = getMenuItemById(id);
        menuItem.setAvailable(!menuItem.getAvailable());
        menuItemRepository.save(menuItem);
    }
    
    public MenuItem saveMenuItem(MenuItem menuItem) {
        return menuItemRepository.save(menuItem);
    }
} 