package pccit.finalproject.javaclient.controller;

import pccit.finalproject.javaclient.model.User;
import pccit.finalproject.javaclient.model.UserTableModel;
import pccit.finalproject.javaclient.utils.HttpUtils;
import pccit.finalproject.javaclient.view.AdminDashboard;
import pccit.finalproject.javaclient.view.LoginPanel;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.util.List;
import java.util.concurrent.ExecutionException;

public class AdminController {
    private AdminDashboard dashboard;
    private LoginPanel loginPanel;
    private UserTableModel userTableModel;
    private String adminName = "";

    public AdminController(AdminDashboard dashboard) {
        this.dashboard = dashboard;
        this.loginPanel = dashboard.getLoginPanel();
        // Ensure loginPanel is obtained from the dashboard

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
                    int confirm = JOptionPane.showConfirmDialog(
                            dashboard,
                            "Are you sure you want to delete this admin?",
                            "Confirm Deletion",
                            JOptionPane.YES_NO_OPTION
                    );
                    if (confirm == JOptionPane.YES_OPTION) {
                        deleteAdmin(adminName);
                        loginPanel.setLoggedInState(false, adminName);
                    }
                } catch (Exception ex) {
                    throw new RuntimeException(ex);
                }
            }
        });
    }

    private void login() {
        String username = loginPanel.getUsername();
        String password = loginPanel.getPassword();

        try {
            String requestBody = "{\"username\":\"" + username + "\",\"pwd\":\"" + password + "\"}";

            String response = HttpUtils.sendPostRequestWithBody("/api/admins", requestBody);
            System.out.println("res:" + response);

            if (response.equals("null")) {
                JOptionPane.showMessageDialog(dashboard, "Access denied.");
                username = loginPanel.getUsername();
                loginPanel.setLoggedInState(false, username);
            } else {
                loginPanel.setLoggedInState(true, username);
                adminName = username;
                loadUsers();
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(dashboard, "Login failed: " + ex.getMessage());
            logout();
        }
    }

    private void logout() {
        JOptionPane.showMessageDialog(dashboard, "Logged out.");
        String username = loginPanel.getUsername();
        loginPanel.setLoggedInState(false, username);
    }

    private void deleteAdmin(String adminName) throws Exception {
        String requestBody = "{\"username\":\"" + adminName + "\"}";
        try {
            HttpUtils.sendDeleteRequestWithBody("/api/admins", requestBody);
            JOptionPane.showMessageDialog(dashboard, "Delete admin successful!");
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(dashboard, "Delete failed: " + ex.getMessage());
        }
    }

    public void loadUsers() {
        SwingWorker<List<User>, Void> worker = HttpUtils.fetchUsersInBackground();
        worker.execute();

        worker.addPropertyChangeListener(evt -> {
            if (SwingWorker.StateValue.DONE == evt.getNewValue()) {
                try {
                    List<User> users = worker.get();
                    userTableModel = new UserTableModel(users);
                    dashboard.setTableModel(userTableModel);
                } catch (InterruptedException | ExecutionException e) {
                    e.printStackTrace();
                    JOptionPane.showMessageDialog(dashboard, "Error loading users: " + e.getMessage());
                }
            }
        });
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
            // Delete the user from the database
            String response = HttpUtils.deleteUserFromBackend(userId);
            if ("success".equals(response)) {
                // Remove the user from the list
                userTableModel.getUsers().remove(rowIndex);
                // Notify the table that data has been updated
                userTableModel.fireTableDataChanged();

                // Clear the user info panel
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
