package com.asu.sundevilcafeteria.service;

import com.asu.sundevilcafeteria.model.*;
import com.asu.sundevilcafeteria.repository.MenuItemRepository;
import com.asu.sundevilcafeteria.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;

@Service
public class DataInitializationService implements CommandLineRunner {
    
    @Autowired
    private MenuItemRepository menuItemRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeUsers();
        initializeMenuItems();
    }
    
    private void initializeUsers() {
        // Check if users already exist
        if (userRepository.count() > 0) {
            return;
        }
        
        // Create default users for testing
        List<User> defaultUsers = Arrays.asList(
            new User("manager", "manager@sundevil.edu", passwordEncoder.encode("password123"), "Manager User", Role.MANAGER),
            new User("worker", "worker@sundevil.edu", passwordEncoder.encode("password123"), "Worker User", Role.WORKER),
            new User("customer", "customer@sundevil.edu", passwordEncoder.encode("password123"), "Customer User", Role.CUSTOMER)
        );
        
        userRepository.saveAll(defaultUsers);
        System.out.println("✅ Default users created successfully");
    }
    
    private void initializeMenuItems() {
        // Check if menu items already exist
        if (menuItemRepository.count() > 0) {
            return;
        }
        
        List<MenuItem> menuItems = Arrays.asList(
            // Breakfast Items
            new MenuItem("French Toast", "Slices of bread dipped in egg and grilled to perfection", new BigDecimal("8.99"), MealCategory.BREAKFAST),
            new MenuItem("Pancakes", "Fluffy pancakes served with maple syrup and butter", new BigDecimal("7.99"), MealCategory.BREAKFAST),
            new MenuItem("Breakfast Burrito", "Scrambled eggs, cheese, hash browns, and choice of meat wrapped in a tortilla", new BigDecimal("9.49"), MealCategory.BREAKFAST),
            new MenuItem("Avocado Toast", "Toasted bread topped with fresh avocado, tomatoes, and seasonings", new BigDecimal("6.99"), MealCategory.BREAKFAST),
            new MenuItem("Oatmeal Bowl", "Steel-cut oats with fresh berries, nuts, and honey", new BigDecimal("5.99"), MealCategory.BREAKFAST),
            new MenuItem("Breakfast Sandwich", "English muffin with egg, cheese, and choice of meat", new BigDecimal("6.49"), MealCategory.BREAKFAST),
            
            // Lunch Items
            new MenuItem("Grilled Chicken Salad", "Fresh mixed greens with grilled chicken, vegetables, and choice of dressing", new BigDecimal("11.99"), MealCategory.LUNCH),
            new MenuItem("Turkey Club Sandwich", "Triple-decker sandwich with turkey, bacon, lettuce, tomato, and mayo", new BigDecimal("10.49"), MealCategory.LUNCH),
            new MenuItem("Veggie Wrap", "Hummus, fresh vegetables, and greens wrapped in a spinach tortilla", new BigDecimal("8.99"), MealCategory.LUNCH),
            new MenuItem("Chicken Caesar Wrap", "Grilled chicken, romaine lettuce, parmesan, and caesar dressing", new BigDecimal("9.99"), MealCategory.LUNCH),
            new MenuItem("Quinoa Bowl", "Quinoa with roasted vegetables, chickpeas, and tahini dressing", new BigDecimal("10.99"), MealCategory.LUNCH),
            new MenuItem("Fish Tacos", "Two soft tacos with grilled fish, cabbage slaw, and chipotle sauce", new BigDecimal("12.49"), MealCategory.LUNCH),
            
            // Dinner Items
            new MenuItem("Grilled Salmon", "Atlantic salmon with lemon herb seasoning, served with rice and vegetables", new BigDecimal("16.99"), MealCategory.DINNER),
            new MenuItem("Chicken Parmesan", "Breaded chicken breast with marinara sauce and melted mozzarella", new BigDecimal("14.99"), MealCategory.DINNER),
            new MenuItem("Beef Stir Fry", "Tender beef with mixed vegetables in a savory sauce, served over rice", new BigDecimal("13.99"), MealCategory.DINNER),
            new MenuItem("Vegetarian Pasta", "Penne pasta with seasonal vegetables in a garlic olive oil sauce", new BigDecimal("11.99"), MealCategory.DINNER),
            new MenuItem("BBQ Ribs", "Half rack of tender ribs with house BBQ sauce, served with fries", new BigDecimal("17.99"), MealCategory.DINNER),
            new MenuItem("Stuffed Bell Peppers", "Bell peppers filled with rice, ground turkey, and herbs", new BigDecimal("12.99"), MealCategory.DINNER),
            
            // Beverages
            new MenuItem("Fresh Coffee", "Freshly brewed coffee - regular or decaf", new BigDecimal("2.49"), MealCategory.BEVERAGES),
            new MenuItem("Iced Tea", "Refreshing iced tea - sweet or unsweetened", new BigDecimal("2.99"), MealCategory.BEVERAGES),
            new MenuItem("Fresh Orange Juice", "100% pure orange juice", new BigDecimal("3.49"), MealCategory.BEVERAGES),
            new MenuItem("Smoothie", "Mixed berry smoothie with yogurt and honey", new BigDecimal("4.99"), MealCategory.BEVERAGES),
            new MenuItem("Hot Chocolate", "Rich hot chocolate topped with whipped cream", new BigDecimal("3.99"), MealCategory.BEVERAGES),
            new MenuItem("Sparkling Water", "Refreshing sparkling water with lemon", new BigDecimal("2.29"), MealCategory.BEVERAGES),
            
            // Additional Categories
            new MenuItem("Chips & Guacamole", "Fresh tortilla chips served with house-made guacamole", new BigDecimal("5.99"), MealCategory.SNACKS),
            new MenuItem("Fruit Cup", "Fresh seasonal fruit", new BigDecimal("4.49"), MealCategory.SNACKS),
            new MenuItem("Chocolate Cake", "Rich chocolate cake with chocolate frosting", new BigDecimal("4.99"), MealCategory.DESSERTS),
            new MenuItem("Apple Pie", "Classic apple pie with cinnamon", new BigDecimal("4.49"), MealCategory.DESSERTS)
        );
        
        menuItemRepository.saveAll(menuItems);
        System.out.println("✅ Sample menu items created successfully");
        System.out.println("📊 Menu breakdown:");
        System.out.println("   - Breakfast: 6 items");
        System.out.println("   - Lunch: 6 items");
        System.out.println("   - Dinner: 6 items");
        System.out.println("   - Beverages: 6 items");
        System.out.println("   - Snacks: 2 items");
        System.out.println("   - Desserts: 2 items");
    }
} 