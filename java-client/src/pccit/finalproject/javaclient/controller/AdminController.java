package pccit.finalproject.javaclient.controller;

import pccit.finalproject.javaclient.utils.*;
import pccit.finalproject.javaclient.view.AdminDashboard;
import pccit.finalproject.javaclient.view.LoginPanel;
import pccit.finalproject.javaclient.utils.HttpUtils;

import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;


public class AdminController {
    private AdminDashboard dashboard;
    private LoginPanel loginPanel;
    public AdminController(AdminDashboard dashboard) {
        this.dashboard = dashboard;
        loginPanel = dashboard.getLoginPanel();

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
        String username = LoginPanel.getUsername();
        String password = LoginPanel.getPassword();

        try {
            String requestBody= "{\"username\":\""+username+"\",\"pwd\":\""+password+"\"}";

            String response = HttpUtils.sendPostRequestWithBody("/api/admins", requestBody);
            System.out.println("res:"+response);

            if (response.equals("null") ) {
                JOptionPane.showMessageDialog(dashboard, "Access denied.");
                logout();
            } else {
                loginPanel.setLoggedInState(true,username);
                JOptionPane.showMessageDialog(dashboard, "Login successful!");
                // display table
            }
        } catch (Exception ex) {
            JOptionPane.showMessageDialog(dashboard, "Login failed: " + ex.getMessage());
            logout();
        }
    }

    private void logout() {
        String username = LoginPanel.getUsername();
        loginPanel.setLoggedInState(false, username);
        loginPanel.clearFields();
        //later implement clear user table method and call here
        JOptionPane.showMessageDialog(dashboard, "Logged out.");

    }
    private void clearUserTable() {

    }
}
