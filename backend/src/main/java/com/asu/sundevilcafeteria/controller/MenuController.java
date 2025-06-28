package com.asu.sundevilcafeteria.controller;

import com.asu.sundevilcafeteria.dto.MenuItemDto;
import com.asu.sundevilcafeteria.model.MealCategory;
import com.asu.sundevilcafeteria.model.MenuItem;
import com.asu.sundevilcafeteria.service.MenuItemService;
import com.asu.sundevilcafeteria.service.CloudStorageService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/menu")
@CrossOrigin(origins = "*")
public class MenuController {
    
    @Autowired
    private MenuItemService menuItemService;
    
    @Autowired
    private CloudStorageService cloudStorageService;
    
    @GetMapping
    public ResponseEntity<List<MenuItem>> getAllMenuItems() {
        List<MenuItem> menuItems = menuItemService.getAvailableMenuItems();
        return ResponseEntity.ok(menuItems);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<MenuItem>> getAllMenuItemsIncludingUnavailable() {
        List<MenuItem> menuItems = menuItemService.getAllMenuItems();
        return ResponseEntity.ok(menuItems);
    }
    
    @GetMapping("/category/{category}")
    public ResponseEntity<List<MenuItem>> getMenuItemsByCategory(@PathVariable MealCategory category) {
        List<MenuItem> menuItems = menuItemService.getMenuItemsByCategory(category);
        return ResponseEntity.ok(menuItems);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> getMenuItemById(@PathVariable Long id) {
        try {
            MenuItem menuItem = menuItemService.getMenuItemById(id);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createMenuItem(@Valid @RequestBody MenuItemDto menuItemDto) {
        try {
            MenuItem menuItem = menuItemService.createMenuItem(menuItemDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(menuItem);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to create menu item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @Valid @RequestBody MenuItemDto menuItemDto) {
        try {
            MenuItem menuItem = menuItemService.updateMenuItem(id, menuItemDto);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update menu item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id) {
        try {
            menuItemService.deleteMenuItem(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Menu item deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PatchMapping("/{id}/toggle-availability")
    public ResponseEntity<?> toggleMenuItemAvailability(@PathVariable Long id) {
        try {
            menuItemService.toggleAvailability(id);
            MenuItem menuItem = menuItemService.getMenuItemById(id);
            return ResponseEntity.ok(menuItem);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadMenuItemImage(@PathVariable Long id, @RequestParam("image") MultipartFile file) {
        try {
            // Validate menu item exists
            MenuItem menuItem = menuItemService.getMenuItemById(id);
            
            // Upload image to Cloud Storage
            String imageUrl = cloudStorageService.uploadImage(file);
            
            // Update menu item with new image URL
            menuItem.setImageUrl(imageUrl);
            MenuItem updatedMenuItem = menuItemService.saveMenuItem(menuItem);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Image uploaded successfully");
            response.put("imageUrl", imageUrl);
            response.put("menuItem", updatedMenuItem);
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Error e) {
            // Catch NoSuchMethodError and other JVM errors
            Map<String, String> error = new HashMap<>();
            error.put("error", "System error during image upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        } catch (Throwable e) {
            // Catch any other throwable
            Map<String, String> error = new HashMap<>();
            error.put("error", "Unexpected error during image upload: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @DeleteMapping("/{id}/image")
    public ResponseEntity<?> deleteMenuItemImage(@PathVariable Long id) {
        try {
            MenuItem menuItem = menuItemService.getMenuItemById(id);
            
            if (menuItem.getImageUrl() != null) {
                // Delete image from Cloud Storage
                cloudStorageService.deleteImage(menuItem.getImageUrl());
                
                // Remove image URL from menu item
                menuItem.setImageUrl(null);
                menuItemService.saveMenuItem(menuItem);
            }
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Image deleted successfully");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
} 