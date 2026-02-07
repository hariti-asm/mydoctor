package ma.hariti.asmaa.mydoctor.userservice.exception;

import ma.hariti.asmaa.mydoctor.userservice.exception.UserNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.data.rest.webmvc.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFound(ResourceNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(UserNotFoundException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<Object> handleBadCredentials(BadCredentialsException ex) {
        Map<String, Object> body = new HashMap<>();
        body.put("message", "Invalid email or password");
        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllExceptions(Exception ex, WebRequest request) {
        System.err.println("GLOBAL EXCEPTION CAUGHT: " + ex.getClass().getName() + " - " + ex.getMessage());
        ex.printStackTrace();

        Map<String, Object> body = new HashMap<>();
        body.put("message", ex.getMessage());
        body.put("type", ex.getClass().getName());

        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
