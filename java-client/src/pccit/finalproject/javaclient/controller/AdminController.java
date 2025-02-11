package pccit.finalproject.javaclient.controller;

import pccit.finalproject.javaclient.model.User;
import pccit.finalproject.javaclient.model.UserTableModel;
import pccit.finalproject.javaclient.utils.HttpUtils;
import pccit.finalproject.javaclient.view.AdminDashboard;
import pccit.finalproject.javaclient.view.LoginPanel;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.ArrayList;
import java.util.List;


public class AdminController {
    private AdminDashboard dashboard;
    private LoginPanel loginPanel;
    private UserTableModel userTableModel;
    private String adminName = "";

    public AdminController(AdminDashboard dashboard) {
        this.dashboard = dashboard;
        this.loginPanel = dashboard.getLoginPanel(); // 确保从 dashboard 获取 loginPanel

        loginPanel.setLoginAction(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                login();
            }
        });

        loginPanel.setLogoutAction(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                logout();
            }
        });

        loginPanel.setDeleteAction(new ActionListener() {
            @Override
            public void actionPerformed(ActionEvent e) {
                try {
                    deleteAdmin(adminName);
                    // 清空用户信息（头像和用户名）并隐藏
                    dashboard.clearUserTable();

                    // 清除登录面板
                    String username = loginPanel.getUsername();
                    loginPanel.setLoggedInState(false, username);
                    loginPanel.clearFields();
                } catch (Exception ex) {
                    throw new RuntimeException(ex);
                }

            }
        });
    }

    private String login() {
        String username = loginPanel.getUsername();
        String password = loginPanel.getPassword();

        try {
            String requestBody = "{\"username\":\"" + username + "\",\"pwd\":\"" + password + "\"}";

            String response = HttpUtils.sendPostRequestWithBody("/api/admins", requestBody);
            System.out.println("res:" + response);

            if (response.equals("null")) {
                JOptionPane.showMessageDialog(dashboard, "Access denied.");
                //logout();
                // 清除登录面板
                username = loginPanel.getUsername();
                loginPanel.setLoggedInState(false, username);
                loginPanel.clearFields();
            } else {
                loginPanel.setLoggedInState(true, username);
                JOptionPane.showMessageDialog(dashboard, "Login successful!");

                // 通过 dashboard 获取 userTable，并设置其可见性
                dashboard.getUserTable().setVisible(true); // 恢复表格的显示
                loadUsers();
                adminName = username;
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(dashboard, "Login failed: " + ex.getMessage());
            logout();
        }
        return adminName;
    }


    private void logout() {
        // 清空用户信息（头像和用户名）并隐藏
        dashboard.clearUserTable();

        // 清除登录面板
        String username = loginPanel.getUsername();
        loginPanel.setLoggedInState(false, username);
        loginPanel.clearFields();

        JOptionPane.showMessageDialog(dashboard, "Logged out.");
    }

    private void deleteAdmin(String adminName) throws Exception {
        String requestBody = "{\"username\":\"" + adminName + "\"}";
        try {
            HttpUtils.sendDeleteRequestWithBody("/api/admins", requestBody);
            JOptionPane.showMessageDialog(dashboard, "Delete admin successful!");

        }catch (Exception ex){
            JOptionPane.showMessageDialog(dashboard, "Delete failed: " + ex.getMessage());
        }

    }

    private void loadUsers() {
        List<User> users = HttpUtils.getUsersFromBackend();
        userTableModel = new UserTableModel(users);
        dashboard.setTableModel(userTableModel);
    }

    public void displayUserInfo(int rowIndex) {
        User user = userTableModel.getUsers().get(rowIndex);
        System.out.println("Selected user: " + user.getUsername() + ", Icon path: " + user.getIcon());
        ImageIcon icon = HttpUtils.getUserIcon(user);
        System.out.println("Icon loaded: " + (icon != null));
        dashboard.setUserInfo(user.getUsername(), icon);
    }

    public void deleteUser(int rowIndex) {
        User user = userTableModel.getUsers().get(rowIndex);
        int userId = user.getId();

        try {
            // 删除数据库中的用户
            String response = HttpUtils.deleteUserFromBackend(userId);
            if ("success".equals(response)) {
                // 从列表中移除用户
                userTableModel.getUsers().remove(rowIndex);
                userTableModel.fireTableDataChanged(); // 通知表格数据已更新

                // 清空用户信息面板
                dashboard.setUserInfo("", null);
                JOptionPane.showMessageDialog(dashboard, "User deleted successfully.");
            } else {
                JOptionPane.showMessageDialog(dashboard, "Failed to delete user: " + response);
            }
        } catch (Exception e) {
            JOptionPane.showMessageDialog(dashboard, "Error: " + e.getMessage());
        }
    }
}

