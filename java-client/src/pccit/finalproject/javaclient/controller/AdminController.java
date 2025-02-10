package pccit.finalproject.javaclient.controller;

import pccit.finalproject.javaclient.utils.HttpClient;
import pccit.finalproject.javaclient.view.AdminDashboard;
import pccit.finalproject.javaclient.view.LoginPanel;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class AdminController {
    private AdminDashboard dashboard;

    public AdminController(AdminDashboard dashboard) {
        this.dashboard = dashboard;
        LoginPanel loginPanel = dashboard.getLoginPanel();

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
    }

    private void login() {
        LoginPanel loginPanel = dashboard.getLoginPanel();
        String username = loginPanel.getUsername();
        String password = loginPanel.getPassword();

        try {
            String response = HttpClient.sendPostRequest("/login", "{ \"username\": \"" + username + "\", \"password\": \"" + password + "\" }");
            if (response.contains("admin")) {
                JOptionPane.showMessageDialog(dashboard, "Login successful!");
            } else {
                JOptionPane.showMessageDialog(dashboard, "Access denied.");
                logout();
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(dashboard, "Login failed: " + ex.getMessage());
        }
    }

    private void logout() {
        JOptionPane.showMessageDialog(dashboard, "Logged out.");
    }
}
